import React from 'react';
import CardElement from '../Card';

export default {
    component: CardElement,
    title: 'Elements/Card',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <CardElement header={<h1>Title</h1>} />;

export const WithTheme = () => (
    <CardElement header={<h1>Title</h1>} footer={<p>Footer</p>} theme="danger" />
);

export const WithClose = () => (
    <CardElement header="Title" footer={<p>Footer</p>} onClose={() => {}} />
);

export const LikeMedia = () => (
    <div style={{ width: 400 }}>
        <CardElement
            title="CardTitle"
            image="http://www.fillmurray.com/200/300"
            // imageClassName="img-thumbnail"
            footer="Size: 1200x630"
            onClose={() => {}}
        />
    </div>
);

// export const ImageLeft = () => (
//     <div style={{ width: 320 }}>
//         <CardElement
//             title="CardTitleisvery longandcomplicatedandstuff"
//             subtitle="Cool guy"
//             image="http://www.fillmurray.com/500/300"
//             footer="Size: 1200x630"
//             onClose={() => {}}
//             imageLeft
//         >
//             <p>This is very cool</p>
//             <p>I like this</p>
//         </CardElement>
//     </div>
// );
