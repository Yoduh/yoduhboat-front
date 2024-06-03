type Guild = {
  features: Array<any>;
  icon: string;
  id: string;
  image: string;
  name: string;
  owner: boolean;
  permissions: number;
  permissions_new: string;
};

type Token = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

type Song = {
  addedBy: string;
  avatar: string;
  thumbnail: string;
  title: string;
  artist: string;
  duration: number;
  durationTime: string;
  link: string;
  source: string;
  _id: string;
};

type YoutubeResult = {
  durationInSec: number;
  durationRaw: string;
  id: string;
  thumbnails: [
    {
      url: string;
      width: number;
      height: number;
    }
  ];
  title: string;
  url: string;
  channel: Record<string, unknown>;
  added: boolean;
  addedNext: boolean;
};

type YoutubePlaylist = {
  durationInSec: number;
  durationRaw: string;
  id: string;
  count: number;
  songs: YoutubeResult[];
  thumbnail: string;
  title: string;
  url: string;
  channel: Record<string, unknown>;
  added: boolean;
  addedNext: boolean;
};

type Queue = Song[];

type Playlist = {
  id: string;
  name: string;
  songsNum: number;
  duration: string;
  createdBy: string;
  songs?: Song[];
};

type ActionHistory = {
  _id: string;
  action: string | string[];
  user: {
    _id: string;
    global_name: string;
  };
  song: Song;
  createdAt: string;
};
