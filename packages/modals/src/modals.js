import DialogModal from '@panneau/modal-dialog';
import UploadModal from '@panneau/modal-upload';

const modals = { DialogModal, UploadModal };

export const modalsArray = Object.keys(modals).map((name) => modals[name]);

export default modals;
