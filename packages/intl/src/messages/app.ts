import { defineMessage } from '../message';

/**
 * The messages of `@panneau/app`, with their English text, which is also the default one. French
 * is in `../fr/app.ts`.
 */
export const appMessages = {
    loading: defineMessage({ id: 'panneau.app.loading', defaultMessage: 'Loading…' }),
    loadError: defineMessage({
        id: 'panneau.app.loadError',
        defaultMessage: 'The admin panel could not be loaded.',
    }),
    retry: defineMessage({ id: 'panneau.app.retry', defaultMessage: 'Try again' }),
    sessionEnded: defineMessage({
        id: 'panneau.app.sessionEnded',
        defaultMessage: 'Your session has ended.',
    }),
    logIn: defineMessage({ id: 'panneau.app.logIn', defaultMessage: 'Log in' }),
    logInAgain: defineMessage({
        id: 'panneau.app.logInAgain',
        defaultMessage: 'Your session has ended. Log in again to continue.',
    }),
    logInError: defineMessage({
        id: 'panneau.app.logInError',
        defaultMessage: 'You could not be logged in. Try again.',
    }),
    email: defineMessage({ id: 'panneau.app.email', defaultMessage: 'Email' }),
    password: defineMessage({ id: 'panneau.app.password', defaultMessage: 'Password' }),
    token: defineMessage({ id: 'panneau.app.token', defaultMessage: 'Token' }),
    remember: defineMessage({ id: 'panneau.app.remember', defaultMessage: 'Remember me' }),
    logInWith: defineMessage<{ provider: string }>({
        id: 'panneau.app.logInWith',
        defaultMessage: 'Log in with {provider}',
    }),
    or: defineMessage({ id: 'panneau.app.or', defaultMessage: 'or' }),
    forgotPassword: defineMessage({
        id: 'panneau.app.forgotPassword',
        defaultMessage: 'Forgot your password?',
    }),
    forgotPasswordTitle: defineMessage({
        id: 'panneau.app.forgotPasswordTitle',
        defaultMessage: 'Reset your password',
    }),
    forgotPasswordHelp: defineMessage({
        id: 'panneau.app.forgotPasswordHelp',
        defaultMessage:
            'Enter the email address of your account, and we’ll send you a link to choose a new password.',
    }),
    sendResetLink: defineMessage({
        id: 'panneau.app.sendResetLink',
        defaultMessage: 'Send the link',
    }),
    resetLinkSent: defineMessage({
        id: 'panneau.app.resetLinkSent',
        defaultMessage:
            'If an account has this address, a link to choose a new password is on its way. It can take a few minutes.',
    }),
    sendError: defineMessage({
        id: 'panneau.app.sendError',
        defaultMessage: 'The link could not be sent. Try again.',
    }),
    backToLogIn: defineMessage({ id: 'panneau.app.backToLogIn', defaultMessage: 'Back to login' }),
    resetPasswordTitle: defineMessage({
        id: 'panneau.app.resetPasswordTitle',
        defaultMessage: 'Choose a new password',
    }),
    newPassword: defineMessage({ id: 'panneau.app.newPassword', defaultMessage: 'New password' }),
    confirmPassword: defineMessage({
        id: 'panneau.app.confirmPassword',
        defaultMessage: 'Confirm the new password',
    }),
    passwordsDiffer: defineMessage({
        id: 'panneau.app.passwordsDiffer',
        defaultMessage: 'The two passwords are different.',
    }),
    resetPassword: defineMessage({
        id: 'panneau.app.resetPassword',
        defaultMessage: 'Change the password',
    }),
    resetPasswordError: defineMessage({
        id: 'panneau.app.resetPasswordError',
        defaultMessage: 'The password could not be changed. Try again.',
    }),
    resetLinkIncomplete: defineMessage({
        id: 'panneau.app.resetLinkIncomplete',
        defaultMessage: 'This link is incomplete. Ask for a new one from the login page.',
    }),
    passwordWasReset: defineMessage({
        id: 'panneau.app.passwordWasReset',
        defaultMessage: 'Your password was changed. Log in with your new password.',
    }),
    verifyEmailTitle: defineMessage({
        id: 'panneau.app.verifyEmailTitle',
        defaultMessage: 'Verify your email address',
    }),
    verifyEmailHelp: defineMessage({
        id: 'panneau.app.verifyEmailHelp',
        defaultMessage:
            'Open the link we sent to your email address to verify it, then continue. If you can’t find it, we can send a new one.',
    }),
    sendVerificationLink: defineMessage({
        id: 'panneau.app.sendVerificationLink',
        defaultMessage: 'Send a new link',
    }),
    verificationLinkSent: defineMessage({
        id: 'panneau.app.verificationLinkSent',
        defaultMessage: 'A new link is on its way. It can take a few minutes.',
    }),
    verifyingEmail: defineMessage({
        id: 'panneau.app.verifyingEmail',
        defaultMessage: 'Verifying your email address…',
    }),
    emailWasVerified: defineMessage({
        id: 'panneau.app.emailWasVerified',
        defaultMessage: 'Your email address is verified.',
    }),
    verifyEmailError: defineMessage({
        id: 'panneau.app.verifyEmailError',
        defaultMessage: 'Your email address could not be verified. Try again.',
    }),
    verifyLinkIncomplete: defineMessage({
        id: 'panneau.app.verifyLinkIncomplete',
        defaultMessage: 'This link is incomplete. Open the link of the email again.',
    }),
    continue: defineMessage({ id: 'panneau.app.continue', defaultMessage: 'Continue' }),
    account: defineMessage({ id: 'panneau.app.account', defaultMessage: 'Your account' }),
    accountProfile: defineMessage({ id: 'panneau.app.accountProfile', defaultMessage: 'Profile' }),
    name: defineMessage({ id: 'panneau.app.name', defaultMessage: 'Name' }),
    saveAccount: defineMessage({ id: 'panneau.app.saveAccount', defaultMessage: 'Save' }),
    accountSaved: defineMessage({
        id: 'panneau.app.accountSaved',
        defaultMessage: 'Your account was saved.',
    }),
    accountSaveError: defineMessage({
        id: 'panneau.app.accountSaveError',
        defaultMessage: 'Your account could not be saved. Try again.',
    }),
    accountLoadError: defineMessage({
        id: 'panneau.app.accountLoadError',
        defaultMessage: 'Your account could not be loaded.',
    }),
    currentPassword: defineMessage({
        id: 'panneau.app.currentPassword',
        defaultMessage: 'Current password',
    }),
    changePassword: defineMessage({
        id: 'panneau.app.changePassword',
        defaultMessage: 'Change the password',
    }),
    passwordChanged: defineMessage({
        id: 'panneau.app.passwordChanged',
        defaultMessage: 'Your password was changed.',
    }),
    twoFactorOn: defineMessage({
        id: 'panneau.app.twoFactorOn',
        defaultMessage: 'Two-factor authentication is on.',
    }),
    twoFactorOffHelp: defineMessage({
        id: 'panneau.app.twoFactorOffHelp',
        defaultMessage:
            'Add a second step to your login: a code of an authenticator app on your phone.',
    }),
    newRecoveryCodes: defineMessage({
        id: 'panneau.app.newRecoveryCodes',
        defaultMessage: 'New recovery codes',
    }),
    turnOffTwoFactor: defineMessage({
        id: 'panneau.app.turnOffTwoFactor',
        defaultMessage: 'Turn it off',
    }),
    twoFactorRequired: defineMessage({
        id: 'panneau.app.twoFactorRequired',
        defaultMessage: 'Your account requires it: it can’t be turned off.',
    }),
    twoFactorTitle: defineMessage({
        id: 'panneau.app.twoFactorTitle',
        defaultMessage: 'Two-factor authentication',
    }),
    twoFactorCodeHelp: defineMessage({
        id: 'panneau.app.twoFactorCodeHelp',
        defaultMessage: 'Enter the code that your authenticator app shows.',
    }),
    twoFactorRecoveryHelp: defineMessage({
        id: 'panneau.app.twoFactorRecoveryHelp',
        defaultMessage: 'Enter one of your recovery codes. Each one works once.',
    }),
    authenticationCode: defineMessage({
        id: 'panneau.app.authenticationCode',
        defaultMessage: 'Code',
    }),
    recoveryCode: defineMessage({
        id: 'panneau.app.recoveryCode',
        defaultMessage: 'Recovery code',
    }),
    withRecoveryCode: defineMessage({
        id: 'panneau.app.withRecoveryCode',
        defaultMessage: 'Use a recovery code',
    }),
    withAuthenticationCode: defineMessage({
        id: 'panneau.app.withAuthenticationCode',
        defaultMessage: 'Use a code of the app',
    }),
    verify: defineMessage({
        id: 'panneau.app.verify',
        defaultMessage: 'Verify',
    }),
    twoFactorError: defineMessage({
        id: 'panneau.app.twoFactorError',
        defaultMessage: 'The code could not be checked. Try again.',
    }),
    setUpTwoFactor: defineMessage({
        id: 'panneau.app.setUpTwoFactor',
        defaultMessage: 'Set up two-factor authentication',
    }),
    twoFactorRequiredHelp: defineMessage({
        id: 'panneau.app.twoFactorRequiredHelp',
        defaultMessage:
            'Your account needs two-factor authentication. Set it up with an authenticator app to continue.',
    }),
    twoFactorScan: defineMessage({
        id: 'panneau.app.twoFactorScan',
        defaultMessage:
            'Scan the QR code with your authenticator app, or type the key, then enter the code it shows.',
    }),
    twoFactorQrCode: defineMessage({
        id: 'panneau.app.twoFactorQrCode',
        defaultMessage: 'QR code of the key',
    }),
    twoFactorKey: defineMessage({
        id: 'panneau.app.twoFactorKey',
        defaultMessage: 'Key',
    }),
    openInApp: defineMessage({
        id: 'panneau.app.openInApp',
        defaultMessage: 'Open in an authenticator app',
    }),
    confirm: defineMessage({
        id: 'panneau.app.confirm',
        defaultMessage: 'Confirm',
    }),
    cancel: defineMessage({
        id: 'panneau.app.cancel',
        defaultMessage: 'Cancel',
    }),
    done: defineMessage({
        id: 'panneau.app.done',
        defaultMessage: 'Done',
    }),
    recoveryCodes: defineMessage({
        id: 'panneau.app.recoveryCodes',
        defaultMessage: 'Recovery codes',
    }),
    recoveryCodesHelp: defineMessage({
        id: 'panneau.app.recoveryCodesHelp',
        defaultMessage:
            'Keep these recovery codes somewhere safe: each one logs you in once if you lose your authenticator app. They won’t be shown again.',
    }),
    copyCodes: defineMessage({
        id: 'panneau.app.copyCodes',
        defaultMessage: 'Copy the codes',
    }),
    codesCopied: defineMessage({
        id: 'panneau.app.codesCopied',
        defaultMessage: 'Codes copied',
    }),
    twoFactorSetupError: defineMessage({
        id: 'panneau.app.twoFactorSetupError',
        defaultMessage: 'Two-factor authentication could not be set up. Try again.',
    }),
    passwordConfirmationTitle: defineMessage({
        id: 'panneau.app.passwordConfirmationTitle',
        defaultMessage: 'Confirm your password',
    }),
    passwordConfirmationHelp: defineMessage({
        id: 'panneau.app.passwordConfirmationHelp',
        defaultMessage: 'For your security, enter your password to continue.',
    }),
    passwordConfirmationError: defineMessage({
        id: 'panneau.app.passwordConfirmationError',
        defaultMessage: 'The password could not be confirmed. Try again.',
    }),
    logOut: defineMessage({ id: 'panneau.app.logOut', defaultMessage: 'Log out' }),
    logOutError: defineMessage({
        id: 'panneau.app.logOutError',
        defaultMessage: 'You could not be logged out. Try again.',
    }),
    skipToContent: defineMessage({
        id: 'panneau.app.skipToContent',
        defaultMessage: 'Skip to content',
    }),
    navigation: defineMessage({ id: 'panneau.app.navigation', defaultMessage: 'Main navigation' }),
    collapseSidebar: defineMessage({
        id: 'panneau.app.collapseSidebar',
        defaultMessage: 'Collapse the sidebar',
    }),
    expandSidebar: defineMessage({
        id: 'panneau.app.expandSidebar',
        defaultMessage: 'Expand the sidebar',
    }),
    openMenu: defineMessage({ id: 'panneau.app.openMenu', defaultMessage: 'Open the menu' }),
    closeMenu: defineMessage({ id: 'panneau.app.closeMenu', defaultMessage: 'Close the menu' }),
    colorScheme: defineMessage<{ scheme: string }>({
        id: 'panneau.app.colorScheme',
        defaultMessage:
            'Appearance: {scheme, select, light {light} dark {dark} other {same as the system}}',
    }),
    home: defineMessage({ id: 'panneau.app.home', defaultMessage: 'Home' }),
    welcome: defineMessage<{ name: string }>({
        id: 'panneau.app.welcome',
        defaultMessage: 'Welcome, {name}.',
    }),
    create: defineMessage<{ resource: string }>({
        id: 'panneau.app.create',
        defaultMessage: 'New {resource}',
    }),
    edit: defineMessage<{ resource: string }>({
        id: 'panneau.app.edit',
        defaultMessage: 'Edit the {resource}',
    }),
    created: defineMessage<{ resource: string }>({
        id: 'panneau.app.created',
        defaultMessage: 'The {resource} was created.',
    }),
    saved: defineMessage<{ resource: string }>({
        id: 'panneau.app.saved',
        defaultMessage: 'The {resource} was saved.',
    }),
    itemLoadError: defineMessage<{ resource: string }>({
        id: 'panneau.app.itemLoadError',
        defaultMessage: 'The {resource} could not be loaded.',
    }),
    itemPanel: defineMessage<{ resource: string }>({
        id: 'panneau.app.itemPanel',
        defaultMessage: 'Details of the {resource}',
    }),
    editItem: defineMessage({ id: 'panneau.app.editItem', defaultMessage: 'Edit' }),
    preview: defineMessage({ id: 'panneau.app.preview', defaultMessage: 'Preview' }),
    details: defineMessage({ id: 'panneau.app.details', defaultMessage: 'Details' }),
    previewOf: defineMessage<{ title: string }>({
        id: 'panneau.app.previewOf',
        defaultMessage: 'Preview of “{title}”',
    }),
    previewLoading: defineMessage({
        id: 'panneau.app.previewLoading',
        defaultMessage: 'Loading the preview…',
    }),
    previewError: defineMessage({
        id: 'panneau.app.previewError',
        defaultMessage: 'The preview could not be loaded.',
    }),
    previewMissing: defineMessage<{ component: string }>({
        id: 'panneau.app.previewMissing',
        defaultMessage: 'No plugin provides the preview “{component}”.',
    }),
    openPreview: defineMessage({
        id: 'panneau.app.openPreview',
        defaultMessage: 'Open in a new tab',
    }),
    widenPanel: defineMessage({
        id: 'panneau.app.widenPanel',
        defaultMessage: 'Widen the details',
    }),
    narrowPanel: defineMessage({
        id: 'panneau.app.narrowPanel',
        defaultMessage: 'Narrow the details',
    }),
    closePanel: defineMessage({
        id: 'panneau.app.closePanel',
        defaultMessage: 'Close the details',
    }),
    goTo: defineMessage({ id: 'panneau.app.goTo', defaultMessage: 'Go to…' }),
    actionRuns: defineMessage({ id: 'panneau.app.actionRuns', defaultMessage: 'Actions' }),
    actionRunsLabel: defineMessage<{ count: number }>({
        id: 'panneau.app.actionRunsLabel',
        defaultMessage:
            '{count, plural, =0 {Actions} one {Actions, # in progress} other {Actions, # in progress}}',
    }),
    context: defineMessage({ id: 'panneau.app.context', defaultMessage: 'Context' }),
    contextNone: defineMessage({ id: 'panneau.app.contextNone', defaultMessage: 'All' }),
    contextChange: defineMessage<{ context: string }>({
        id: 'panneau.app.contextChange',
        defaultMessage: 'Change the context ({context})',
    }),
    contextRequired: defineMessage({
        id: 'panneau.app.contextRequired',
        defaultMessage: 'Choose where to work',
    }),
    contextRequiredText: defineMessage({
        id: 'panneau.app.contextRequiredText',
        defaultMessage: 'What the admin shows depends on it.',
    }),
    profile: defineMessage<{ name: string }>({
        id: 'panneau.app.profile',
        defaultMessage: 'Your profile ({name})',
    }),
    groupRecent: defineMessage({ id: 'panneau.app.groupRecent', defaultMessage: 'Recent' }),
    groupNavigation: defineMessage({
        id: 'panneau.app.groupNavigation',
        defaultMessage: 'Navigation',
    }),
    groupCreate: defineMessage({ id: 'panneau.app.groupCreate', defaultMessage: 'Create' }),
    groupCommands: defineMessage({ id: 'panneau.app.groupCommands', defaultMessage: 'Commands' }),
    groupActions: defineMessage({ id: 'panneau.app.groupActions', defaultMessage: 'Actions' }),
    groupSearchIn: defineMessage({ id: 'panneau.app.groupSearchIn', defaultMessage: 'Search in' }),
    searchPlaceholder: defineMessage({
        id: 'panneau.app.searchPlaceholder',
        defaultMessage: 'Search…',
    }),
    searchMinLength: defineMessage<{ count: number }>({
        id: 'panneau.app.searchMinLength',
        defaultMessage: 'Type at least {count, plural, one {# character} other {# characters}}.',
    }),
    seeAllResults: defineMessage<{ count: number }>({
        id: 'panneau.app.seeAllResults',
        defaultMessage: 'See all {count, plural, one {# result} other {# results}}',
    }),
    searching: defineMessage({ id: 'panneau.app.searching', defaultMessage: 'Searching…' }),
    searchRateLimited: defineMessage({
        id: 'panneau.app.searchRateLimited',
        defaultMessage: 'Too many searches. Wait a moment before the next one.',
    }),
    searchError: defineMessage({
        id: 'panneau.app.searchError',
        defaultMessage: 'The search failed. The other results are still here.',
    }),
    notFound: defineMessage({ id: 'panneau.app.notFound', defaultMessage: 'Page not found' }),
    notFoundText: defineMessage({
        id: 'panneau.app.notFoundText',
        defaultMessage: 'This page doesn’t exist, or you can’t see it.',
    }),
    itemForbidden: defineMessage<{ resource: string }>({
        id: 'panneau.app.itemForbidden',
        defaultMessage: 'You can’t view this {resource}.',
    }),
    backHome: defineMessage({ id: 'panneau.app.backHome', defaultMessage: 'Back to home' }),
    forbidden: defineMessage({ id: 'panneau.app.forbidden', defaultMessage: 'Access denied' }),
    forbiddenText: defineMessage({
        id: 'panneau.app.forbiddenText',
        defaultMessage: 'You don’t have access to this page. Ask an administrator if you need it.',
    }),
    serverError: defineMessage({
        id: 'panneau.app.serverError',
        defaultMessage: 'Something went wrong',
    }),
    serverErrorText: defineMessage({
        id: 'panneau.app.serverErrorText',
        defaultMessage: 'The server ran into a problem. Try again in a moment.',
    }),
    pageError: defineMessage({
        id: 'panneau.app.pageError',
        defaultMessage: 'Something went wrong',
    }),
    pageErrorText: defineMessage({
        id: 'panneau.app.pageErrorText',
        defaultMessage: 'This page ran into a problem. Try again, or go back to the home page.',
    }),
    offline: defineMessage({ id: 'panneau.app.offline', defaultMessage: 'You’re offline' }),
    offlineText: defineMessage({
        id: 'panneau.app.offlineText',
        defaultMessage: 'Check your connection. The page loads again once you’re back online.',
    }),
    unreachable: defineMessage({
        id: 'panneau.app.unreachable',
        defaultMessage: 'The server can’t be reached',
    }),
    unreachableText: defineMessage({
        id: 'panneau.app.unreachableText',
        defaultMessage: 'It may be down or restarting. Try again in a moment.',
    }),
    missingPage: defineMessage<{ component: string }>({
        id: 'panneau.app.missingPage',
        defaultMessage: 'No plugin provides the page “{component}”.',
    }),
};
