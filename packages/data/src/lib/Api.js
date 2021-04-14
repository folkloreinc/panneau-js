import Base from './Base';

import AuthApi from './Auth';
import AccountApi from './Account';
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
        this.medias = new MediasApi(this);
        this.resources = new ResourcesApi(this);
    }
}

export default Api;
