import React, { Component } from 'react';
import {View, Text, TextInput, Button, StyleSheet, ScrollView, Image, ActivityIndicator} from 'react-native';
import { connect } from 'react-redux';

import {addPlace} from '../../store/actions/index';
import PlaceInput from '../../components/PlaceInput/PlaceInput';
import MainText from '../../components/UI/MainText/MainText';
import HeadingText from '../../components/UI/HeadingText/HeadingText';
import PickImage from '../../components/PickImage/PickImage';
import PickLocation from '../../components/PickLocation/PickLocation';
import validate from '../../utility/validation';
import { startAddPlace } from '../../store/actions/index';


class SharePlaceScreen extends Component {

  static navigatorStyle = {
    navBarButtonColor: "orange"
  }

  componentWillMount() {
    this.reset();
  }


  constructor(props){
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  reset = () => {
    this.setState({
      controls: {
        placeName: {
          value: "",
          valid: false,
          touched: false,
          validationRules: {
            notEmpty: true
          }
        },
        location: {
          value: null,
          valid: false
        },
        image: {
          value: null,
          valid: false
        }
      }
    });
  };

  componentDidUpdate() {
    if (this.props.placeAdded) {
      console.log("Im on componentDidUpdate")
      this.props.navigator.switchToTab({ tabIndex: 0 });
    }
  }

  onNavigatorEvent = event => {
    if (event.type === "ScreenChangedEvent") {
      if (event.id === "willAppear") {
        console.log("Im on onNavigatorEvent")
        this.props.onStartAddPlace();
        console.log("Im on oafter")
      }
    }
    if (event.type === "NavBarButtonPress") {
      if (event.id === "sideDrawerToggle") {
        this.props.navigator.toggleDrawer({
          side: "left"
        });
      }
    }
  };

  placeNameChangedHandler = val => {
    this.setState(prevState => {
      return {
        controls: {
          ...prevState.controls,
          placeName: {
            ...prevState.controls.placeName,
            value: val,
            valid: validate(val, prevState.controls.placeName.validationRules),
            touched: true
          }
        }
      }
    });
  }

  locationPlacedHandler = location => {
    this.setState(prevState => {
      return {
        controls: {
          ...prevState.controls,
          location: {
            value: location,
            valid: true
          }
        }
      }
    });
  }

  placeAddedHandler = () => {
      this.props.onAddPlace(this.state.controls.placeName.value,
        this.state.controls.location.value,
        this.state.controls.image.value
      );
      this.reset();
      this.imagePicker.reset();
      this.locationPicker.reset();
  };

  imagePickedHandler = image => {
    this.setState(prevState => {
      return {
        controls: {
          ...prevState.controls,
          image: {
            value: image,
            valid: true
          }
        }
      };
    });
  }

  render () {
    let submitButton = (
      <Button
        title="Share the place!"
        onPress={this.placeAddedHandler}
        disabled={
            !this.state.controls.placeName.valid ||
            !this.state.controls.location.valid ||
            !this.state.controls.image.valid
          }
      />
    );

    if (this.props.isLoading) {
      submitButton = <ActivityIndicator />;
    }

    return (
      <ScrollView>
        <View style={styles.container}>
          <MainText>
            <HeadingText>Share a Place with us!</HeadingText>
          </MainText>
          <PickImage onImagePicked={this.imagePickedHandler}
            ref={ref => (this.imagePicker = ref)}
          />
          <PickLocation onLocationPicked={this.locationPlacedHandler}
            ref={ref => (this.locationPicker = ref)}
            />
          <PlaceInput
            placeData={this.state.controls.placeName} //sends to PlaceInput
            onChangeText={this.placeNameChangedHandler}
          />
            <View style={styles.button}>
            {submitButton}
            </View>
          </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  placeHolder: {
      borderWidth: 1,
      borderColor: "black",
      backgroundColor: "#eee",
      width: "80%",
      height: 150
  },
  button: {
      margin: 8
  },
  previewImage: {
    width: "100%",
    height: "100%"
  }
});

const mapStateToProps = state => {
  return {
    isLoading: state.ui.isLoading,
    placeAdded: state.places.placeAdded
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAddPlace: (placeName, location, image) =>
    dispatch(addPlace(placeName, location, image)),
    onStartAddPlace: () => dispatch(startAddPlace())

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SharePlaceScreen);
