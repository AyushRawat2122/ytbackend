import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "title",
    sortType = -1,
    userId,
  } = req.query;

  const skips = limit * (page - 1);
  const matchCondition = [{ isPublished: { $eq: true } }];
  if (query) {
    matchCondition.push({
      title: { $regex: query || undefined, $options: "i" },
    });
  }

  const videos = await Video.aggregate([
    {
      $match: {
        $and: matchCondition,
      },
    },
    {
      $skip: parseInt(skips),
    },
    {
      $limit: parseInt(limit),
    },
    {
      $sort: {
        [sortBy]: parseInt(sortType),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel: { $first: "$channel" },
      },
    },
    {
      $project: {
        thumbnail: 1,
        title: 1,
        views: 1,
        channel: 1,
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(500, "an unexpected error emerged while loading videos");
  }

  if (videos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No relevant videos found", []));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "videos fetched successfully", videos));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { _id } = req.user;

  if (title?.trim() === "" || description?.trim() === "") {
    throw new ApiError(400, "title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video and thumbnail are required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video || !thumbnail) {
    throw new ApiError(
      500,
      "an unexpected error ocurred on uploading thumbnail and video"
    );
  }

  const publishedVideo = await Video.create({
    VideoFile: video.url,
    thumbnail: thumbnail.url,
    title: title,
    description: description,
    owner: new mongoose.Types.ObjectId(_id),
    duration: video.duration,
  });

  console.log(publishedVideo);

  if (!publishedVideo) {
    throw new ApiError(500, "something went wrong while publishing video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "video published successfully", publishedVideo));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "videoId is required");

  const video = await Video.aggregate(
    [
      {
        $match:{_id: new mongoose.Types.ObjectId(videoId?.trim())}
      },
      {
        $lookup:{
          from:"users",
          localField:"owner",
          foreignField:"_id",
          as:"channel",
          pipeline:[
            {
              $project:{
                
              }
            },
            {

            }
          ]
        }
      }
    ]
  )

  if (!video) {
    throw new ApiError(400, "Invalid user ID");
  }

  return res
    .status(200)
    .json(new ApiError(200, "video fetched successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
