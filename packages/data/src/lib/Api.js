import Base from './Base';

import MediasApi from './Medias';

class Api extends Base {
    constructor(opts = {}) {
        super(opts);
        this.medias = new MediasApi(opts);
    }
}

export default Api;
