import Base from './Base';

class AuthApi extends Base {
    constructor(opts) {
        super({
            ...opts,
            routes: {
                'auth.check': 'auth/check',
                'auth.login': 'auth/login',
                'auth.register': 'auth/register',
                'auth.logout': 'auth/logout',
                'auth.password.email': 'auth/password/email',
                'auth.password.update': 'auth/password/update',
                ...(opts?.routes || null),
            },
        });
    }

    check() {
        return this.requestGet(this.route('auth.check'));
    }

    login(email, password) {
        return this.requestPost(this.route('auth.login'), {
            email,
            password,
        });
    }

    register(data) {
        return this.requestPost(this.route('auth.register'), data);
    }

    logout() {
        return this.requestPost(this.route('auth.logout'));
    }

    requestPassword(email) {
        return this.requestPost(this.route('auth.password.email'), { email });
    }

    resetPassword(data) {
        return this.requestPost(this.route('auth.password.update'), data);
    }
}

export default AuthApi;
