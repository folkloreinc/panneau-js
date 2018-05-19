/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
// import { shallow, mount } from 'enzyme';
// import sinon from 'sinon';
import { IntlProvider } from 'react-intl';
import PageField from '../PageField';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <PageField
                label="Label"
                value={null}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

// test('value is in <input />', () => {
//     const field = shallow(<PageField value="test" />);
//     expect(field.find('input').prop('value')).toEqual('test');
//
//     const nullField = shallow(<PageField value={null} />);
//     expect(nullField.find('input').prop('value')).toEqual('');
// });
