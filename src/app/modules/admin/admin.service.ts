import { QueryBuilder } from "../../utils/queryBuilder";
import { DriverApprovalStatus } from "../driver/driver.interface";
import { Driver } from "../driver/driver.model";
import Ride from "../ride/ride.model";
import userSearchableFields from "../user/user.constant";
import { IsActive } from "../user/user.interface";
import User from "../user/user.model";

const getAllUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  return user;
};

const getAllDriver = async () => {
  const allDriver = await Driver.find();

  return allDriver;
};

const getAllRides = async () => {
  const allRides = await Ride.find();

  return allRides;
};

const updateUserActiveStatus = async (userId: string, status: IsActive) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      isActive: status,
    },
    { new: true, runValidators: true }
  );

  return updatedUser;
};

const updateDriverApprovalStatus = async (
  driverId: string,
  status: DriverApprovalStatus
) => {
  const updatedDriver = await Driver.findByIdAndUpdate(
    driverId,
    {
      approvalStatus: status,
    },
    { new: true, runValidators: true }
  );

  return updatedDriver;
};

const adminServices = {
  getAllUser,
  getSingleUser,
  getAllDriver,
  getAllRides,
  updateUserActiveStatus,
  updateDriverApprovalStatus,
};

export default adminServices;
