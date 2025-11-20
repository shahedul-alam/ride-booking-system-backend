import { IsActive, Role } from "./../modules/user/user.interface";
import { JwtPayload } from "jsonwebtoken";
/* eslint-disable no-console */
import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "./jwt";
import envVars from "../config/env";
import User from "../modules/user/user.model";
import { Driver } from "../modules/driver/driver.model";
import { DriverAvailabilityStatus } from "../modules/driver/driver.interface";
import driverServices from "../modules/driver/driver.service";

// Map to store active drivers and their WebSocket connections (optional but helpful)
const activeDriverConnections = new Map<string, WebSocket>();

// Simplified interface for the location payload expected from the client
interface LocationPayload {
  accessToken: string; // Expected in the first message for authentication
  lng: number;
  lat: number;
}

const handleDriverDisconnect = async (driverId: string) => {
  try {
    await Driver.findByIdAndUpdate(
      driverId,
      {
        availabilityStatus: DriverAvailabilityStatus.OFFLINE,
        $unset: { currentLocation: 1 },
      },
      { new: true }
    );
    console.log(`Driver ${driverId} successfully marked as OFFLINE.`);
  } catch (error) {
    console.error(
      `Failed to mark driver ${driverId} offline on disconnect:`,
      error
    );
  }
};

/**
 * Initializes and handles all WebSocket connections for driver location streaming.
 * @param server - The HTTP server instance from your Express app.
 */
export const initializeWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server, path: "/ws/location" });
  console.log("WebSocket Server initialized at /ws/location");

  wss.on("connection", (ws: WebSocket, req) => {
    let isAuthenticated = false;
    let driverId: string | null = null;

    console.log(`Driver connected from ${req.socket.remoteAddress}`);

    ws.on("message", async (message: string) => {
      try {
        const data: LocationPayload = JSON.parse(message.toString());

        if (!isAuthenticated) {
          // --- 1. AUTHENTICATION (Runs ONLY on the first message) ---
          const { accessToken } = data;

          if (!accessToken) {
            ws.close(4000, "Access token required for streaming.");
            return;
          }

          // Verify JWT and extract payload
          let decoded;
          try {
            // Assuming verifyToken returns the decoded payload or throws
            decoded = verifyToken(
              accessToken,
              envVars.JWT.JWT_ACCESS_SECRET
            ) as JwtPayload;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            // Token is invalid, expired, or malformed
            ws.close(4001, "Invalid or expired access token.");
            return;
          }

          // check if the user is driver
          if (decoded.role !== Role.DRIVER) {
            ws.close(4002, "Forbidden access.");
            return;
          }

          // Check if user is a valid, active driver (Database read for authorization)
          const user = await User.findById(decoded.userId);
          const driver = await Driver.findOne({ user: user?._id });

          if (!user || !driver || driver?.approvalStatus !== "approved") {
            ws.close(4003, "User is not an approved driver.");
            return;
          }

          if (
            user.isActive === IsActive.BLOCKED ||
            user.isActive === IsActive.INACTIVE ||
            user.isDeleted
          ) {
            ws.close(4004, "Forbidden access.");
            return;
          }

          // c. Success: Set state variables
          driverId = driver._id.toString();
          isAuthenticated = true;
          activeDriverConnections.set(driverId, ws);
          console.log(`Driver ${driverId} authenticated and streaming.`);
          ws.send(
            JSON.stringify({ status: "OK", message: "Streaming started." })
          );
          // Continue to step 2 for the first location update
        }

        // --- 2. LOCATION STREAMING (Runs on 2nd message onwards + after 1st auth) ---
        if (!isAuthenticated || !driverId) return;

        // Ensure data is valid before DB write
        if (typeof data.lng !== "number" || typeof data.lat !== "number") {
          console.warn(`Invalid coordinates from driver ${driverId}`);
          return;
        }

        // CRITICAL CALL: Location update service (uses the low-load authorization check inside the query)
        const success = await driverServices.updateDriverLocation(
          driverId,
          data.lng,
          data.lat
        );

        // If the update failed (e.g., driver profile was suspended mid-stream)
        if (success === false) {
          console.warn(
            `Driver ${driverId} failed authorization check (likely suspended). Terminating stream.`
          );
          ws.close(4005, "Account status changed.");
          return;
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        // Close the socket on any unhandled error
        ws.close(4008, "Internal server error or invalid data.");
      }
    });

    ws.on("close", () => {
      if (driverId) {
        activeDriverConnections.delete(driverId);
        console.log(
          `Driver ${driverId} disconnected. Setting status to OFFLINE.`
        );

        handleDriverDisconnect(driverId);
      }
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for ${driverId}:`, error);
    });
  });
};