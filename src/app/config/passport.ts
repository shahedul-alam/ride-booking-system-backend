import bcryptjs from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import { IsActive } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        // if (!user.isVerified) {
        //   return done("Account is not verified.");
        // }

        if (
          user.isActive === IsActive.BLOCKED ||
          user.isActive === IsActive.INACTIVE
        ) {
          return done(null, false, {
            message: "Account is suspended. Contact administrator.",
          });
        }

        if (user.isDeleted) {
          return done(null, false, { message: "Account is deleted." });
        }

        const isGoogleAuthenticated = user.auths.some(
          (providerObject) => providerObject.provider == "google"
        );

        if (isGoogleAuthenticated && !user.password) {
          return done(null, false, {
            message: `You’ve authenticated via Google. To enable credential-based login (email and password), first log in using Google, then set a password via your registered email. Once configured, you can authenticate using standard credentials.`,
          });
        }

        const isMatch = await bcryptjs.compare(
          password as string,
          user.password as string
        );

        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id);
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
