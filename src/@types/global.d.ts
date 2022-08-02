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
