import React from 'react';
import TextField from '../TextField';

export default {
    title: 'Fields/Text',
    component: TextField,
    parameters: {
        intl: true
    }
};

export const Normal = () => <TextField />;
export const Email = () => <TextField type="email" />;
export const Password = () => <TextField type="password" />;
export const Telephone = () => <TextField type="tel" />;
export const Url = () => <TextField type="url" />;
export const TextArea = () => <TextField type="textarea" />;
export const RichTextFormat = () => <TextField type="rtf" />;
