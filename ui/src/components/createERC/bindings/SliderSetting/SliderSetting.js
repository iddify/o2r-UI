import React, { Component } from 'react';
import { TextField } from "@material-ui/core";

class SliderSetting extends Component {

    render() {
        return (
            <TextField margin="normal" variant="outlined" className={this.props.styles}
                required
                id={this.props.id}
                type={this.props.type}
                label={this.props.label}
                onBlur={this.props.handleSlider}
                InputLabelProps={{
                    shrink: true,
                }}
            />
        );
    }
}

export default SliderSetting;