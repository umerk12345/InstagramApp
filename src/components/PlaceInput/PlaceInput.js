import React, { Component } from 'react';
import{Button, StyleSheet, View, TextInput} from 'react-native';

import DefaultInput from '../UI/DefaultInput/DefaultInput';

const placeInput = props => (
  <DefaultInput
    placeholder="Place Name"
    value={props.placeData.value} //get from outside
    valid={props.placeData.valid}
    touched={props.placeData.touched}
    onChangeText={props.onChangeText}
  />
);

export default placeInput;
