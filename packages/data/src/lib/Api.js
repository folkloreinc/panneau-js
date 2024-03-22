import AccountApi from './Account';
import AuthApi from './Auth';
import Base from './Base';
import MediasApi from './Medias';
import ResourcesApi from './Resources';

class Api extends Base {
    constructor(opts = {}) {
        super(opts);
        this.auth = new AuthApi(this, {
            withCredentials: true,
        });
        this.account = new AccountApi(this, {
            withCredentials: true,
        });
        this.medias = new MediasApi(opts);
        this.resources = new ResourcesApi(this);
        // console.log('opts', opts);
        // console.log('this', this);
    }
}

export default Api;
