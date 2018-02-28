import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
/* eslint-enable import/no-extraneous-dependencies */
import FieldsGroupField from '../FieldsGroup';

test('match snapshot', () => {
    const component = renderer.create((
        <FieldsGroupField
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<FieldsGroupField value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<FieldsGroupField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
