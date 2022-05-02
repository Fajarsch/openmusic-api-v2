const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, collaborationsService, songsService, validator) {
    this._service = service;
    this._collaborationsService = collaborationsService;
    this._songsService = songsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);

      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name, owner: credentialId,
      });

      return h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: { 
          playlistId,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
    }
  }

  async getPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);

      return { 
        status: 'success',
        data: {
          playlists,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
    }
  }

  async deletePlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deletePlaylist(playlistId);

      return h.response({
        status: 'success',
        message: 'Playlist berhasil dihapus',
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validationPostSongPlaylistPayload(request.payload);

      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      await this._songsService.getSongById(songId);
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.addSongPlaylist(playlistId, songId);

      return h.response({
        status: 'success',
        message: 'Lagu ditambahkan ke playlist',
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
    }
  }

  async getPlaylistSongHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      const detailPlaylist = await this._service.getDetailPlaylist(playlistId);
      const playlistSongs = await this._service.getSongPlaylist(playlistId);

      return {
        status: 'success',
        data: {
          playlist: {
            id: detailPlaylist.id,
            name: detailPlaylist.name,
            username: detailPlaylist.username,
            songs: playlistSongs,
          },
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
    }
  }

  async deletePlaylistSongHandler(request, h) {
    try {
      this._validator.validationPostSongPlaylistPayload(request.payload);

      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongPlaylist(playlistId, songId, credentialId);

      return h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus',
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      }).code(500);
    }
  }
}

module.exports = PlaylistsHandler;
