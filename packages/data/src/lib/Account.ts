import Base from './Base';

class AccountApi extends Base {
    constructor(opts) {
        super({
            ...opts,
            routes: {
                account: 'account',
                'account.password': 'account/password',
                'account.delete': 'account/delete',
                ...(opts?.routes || null),
            },
        });
    }

    update(data) {
        return this.requestPost(this.route('account'), data);
    }

    updatePassword(data) {
        return this.requestPost(this.route('account.password'), data);
    }

    delete(data) {
        return this.requestPost(this.route('account.delete'), data);
    }
}

export default AccountApi;
