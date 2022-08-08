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
};

type Queue = Song[];
