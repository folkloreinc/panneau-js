class AccountApi {
    constructor(api, opts) {
        this.api = api;
        this.options = {
            withCredentials: false,
            ...opts,
        };
    }

    update(data) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('account'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    updatePassword(data) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('account.password'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    updateTaxes(data) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('account.taxes'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    delete(data) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('account.delete'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }
}

export default AccountApi;
