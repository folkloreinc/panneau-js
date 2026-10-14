import AccountApi from './Account';
import AuthApi from './Auth';
import Base from './Base';
import MediasApi from './Medias';
import ResourcesApi from './Resources';

class Api extends Base {
    resources: ResourcesApi;
    medias: MediasApi;
    auth: AuthApi;
    account: AccountApi;

    constructor(opts) {
        super(opts);
        this.auth = new AuthApi(opts);
        this.account = new AccountApi(opts);
        this.medias = new MediasApi(opts);
        this.resources = new ResourcesApi(opts);
    }
}

export default Api;
