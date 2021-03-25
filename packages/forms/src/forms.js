// Import forms

import DefaultForm from '@panneau/form-default';
import InlineForm from '@panneau/form-inline';
import HorizontalForm from '@panneau/form-horizontal';

const forms = { DefaultForm, InlineForm, HorizontalForm };

export const formsArray = Object.keys(forms).map((name) => forms[name]);

export default forms;
