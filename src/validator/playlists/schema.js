const Joi = require('joi');

const PostPlaylistSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PostPlaylistSchema, PostSongPlaylistSchema };
