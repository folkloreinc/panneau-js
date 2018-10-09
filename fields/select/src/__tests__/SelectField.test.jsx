import React from 'react';
import Loadable from 'react-loadable';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import { IntlProvider } from 'react-intl';
import { SelectBase, Async as AsyncBase } from 'react-select';
import BaseSelectField from '../SelectField';
import { Select, Async, AsyncCreatable, Creatable } from '../vendors';

const defaultOptions = [
    {
        value: 1,
        label: 'Option 1'
    },
    {
        value: 2,
        label: 'Option 2'
    },
];

const SelectField = props => (
    <IntlProvider locale="en">
        <BaseSelectField {...props} />
    </IntlProvider>
);

test('SelectField match snapshot', async () => {
    await Loadable.preloadAll();

    const selectComponent = renderer.create(<SelectField options={defaultOptions} value={1} />);
    expect(selectComponent.toJSON()).toMatchSnapshot();

    const asyncComponent = renderer.create(<SelectField options={defaultOptions} value={1} async />);
    expect(asyncComponent.toJSON()).toMatchSnapshot();

    const asyncCreatableComponent = renderer.create(<SelectField options={defaultOptions} value={1} async creatable />);
    expect(asyncCreatableComponent.toJSON()).toMatchSnapshot();

    const creatableComponent = renderer.create(<SelectField options={defaultOptions} value={1} creatable />);
    expect(creatableComponent.toJSON()).toMatchSnapshot();
});

test('render Select by default', async () => {
    await Loadable.preloadAll();
    const field = shallow(<SelectField />);
    expect(field.find(Select).length).toEqual(1);
});

test('render Async when async=true', async () => {
    await Loadable.preloadAll();
    const field = shallow(<SelectField async />);
    expect(field.find(Async).length).toEqual(1);
});

test('render AsyncCreatable when async=true and creatable=true', async () => {
    await Loadable.preloadAll();
    const field = shallow(<SelectField async creatable />);
    expect(field.find(AsyncCreatable).length).toEqual(1);
});

test('render Creatable when creatable=true', async () => {
    await Loadable.preloadAll();
    const field = shallow(<SelectField creatable />);
    expect(field.find(Creatable).length).toEqual(1);
});

test('value match option', async () => {
    await Loadable.preloadAll();
    const field = shallow(<SelectField options={defaultOptions} value={1} />);
    expect(field.find(Select).prop('value')).toEqual(defaultOptions[0]);
});

test('value match option when multiple', async () => {
    await Loadable.preloadAll();
    const field = shallow(<SelectField options={defaultOptions} value={[1,2]} multiple />);
    expect(field.find(Select).prop('value')).toEqual(defaultOptions);
});

test('fetch options when async', async () => {
    await Loadable.preloadAll();
    const fetchOptions = () => new Promise(resolve => resolve(defaultOptions));
    const field = mount(<SelectField fetchOptions={fetchOptions} defaultOptions value={[1,2]} async />);
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(field.state('loadedOptions')).toEqual(defaultOptions);
    expect(field.find(AsyncBase).state('defaultOptions')).toEqual(defaultOptions);
});

test('has value when cannotBeEmpty', async () => {
    await Loadable.preloadAll();
    const field = shallow(<SelectField options={defaultOptions} cannotBeEmpty />);
    expect(field.find(Select).prop('value')).toEqual(defaultOptions[0]);
});

test('onChange is called and receive value', async () => {
    const onChange = sinon.spy();
    const field = mount(<SelectField options={defaultOptions} value={1} onChange={onChange} />);
    field.find(Select).prop('onChange')(defaultOptions[0]);
    expect(onChange.calledOnce).toEqual(true);
    expect(onChange.calledWith(1)).toEqual(true);
});
