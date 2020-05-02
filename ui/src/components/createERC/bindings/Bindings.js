import React, { Component } from 'react';
import { makeStyles, Stepper, Step, StepLabel, StepContent, Button, 
        Typography, Paper, RadioGroup, FormControl} from "@material-ui/core";
import ChipInput from 'material-ui-chip-input';

import httpRequests from '../../../helpers/httpRequests';
import Manipulate from '../../erc/Manipulate/Manipulate';
import ComputationalResult from './ComputationalResult/ComputationalResult';
import SelectedCode from './SelectedCode/SelectedCode';
import SliderSetting from './SliderSetting/SliderSetting';
import WidgetSelector from './WidgetSelector/WidgetSelector';
import './bindings.css';
import fakeBindings from '../../../helpers/bindingsExamples.json';
import Sourcecode from '../../erc/Inspect/CodeView/Sourcecode/Sourcecode';
import { parse as RParse } from '../../../helpers/programm-analysis/R';
import {slice} from '../../../helpers/programm-analysis/es6/slice'

const useStyles = makeStyles(theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  connectorActive: {
    '& $connectorLine': {
      borderColor: theme.palette.secondary.main,
    },
  },
  connectorCompleted: {
    '& $connectorLine': {
      borderColor: theme.palette.primary.main,
    },
  },
  connectorDisabled: {
    '& $connectorLine': {
      borderColor: theme.palette.grey[100],
    },
  },
  connectorLine: {
    transition: theme.transitions.create('border-color'),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '90%',
  },
  numField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '20%',
  },
}));

function VerticalLinearStepper ( props ) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Select result from the list below', 'Mark the plot()-Function in the code', 
                  'Select the parameter by marking it in the code on the left', 
                  'Configure a UI widget'];
  const [result, setResult] = React.useState();
  const [widget, setWidget] = React.useState('slider');
  const [disabled, disable] = React.useState(true);
  const params = props.tmpParam;
  const plot = props.tmpPlotFunction;
  if (plot !== '' && disabled && activeStep === 1) {
    disable(false);
  }
  if ( params !== '' && disabled && activeStep === 2) {
    disable(false);
  } 

  const handlePlotChange = () => disable(false);
  const handleParameterChange = () => disable(false);
  const handleSlider =  ( val, field ) => props.setWidget(field, val, widget);
  const handleWidgetChange = ( e ) => setWidget(e.target.value);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    props.setStep(activeStep + 1);
    disable(true);
    if (activeStep === 2) {
      props.setParameter(props.tmpParam);
    }
    if (activeStep === 3) {
      props.saveBinding();
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    props.setStep(activeStep - 1);
    disable(false);
  }

  const handleReset = () => {
    setActiveStep(0);
    props.setStep(0);
    props.clearBinding();
    setResult('');
  }

  const handleResultChange = ( e ) => {
    if (e.target.value === '') {
      disable(true);
      setResult(e.target.value);
    } else {
      setResult(e.target.value);
      props.setResult(e.target.value);
      disable(false);
    }
  }

  const showPreview = () => {
    let binding = props.createBinding();
    httpRequests.sendBinding(binding)
      .then(function (res) {
        httpRequests.runManipulationService(binding)
          .then(function (res2) {
            props.switchCodePreview();
            disable(false);
          })
          .catch(function (res2) {
            console.log(res2);
          })
      })
      .catch(function (res) {
        console.log(res);
      })
  }

  const addParameter = () => {
    props.clearParam();
    setActiveStep(2);
    props.setStep(2);
  }

  const saveErc = () => props.saveErc();

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel><h3>{label}</h3></StepLabel>
            <StepContent>
              {activeStep === 0 && props.figures != '' ?
                <ComputationalResult value={result} figures={props.figures} handleResultChange={handleResultChange} />
              : ''}
              {activeStep === 1 ?
                <SelectedCode id="plotfunction" label="plot() function" handleChange={handlePlotChange} value={plot} />
              : ''}
              {activeStep === 2 ?
                <SelectedCode id="parameter" label="Parameter" handleChange={handleParameterChange} value={props.tmpParam} />
              : ''}
              {activeStep === 3 ?
                <div>
                  <FormControl component="fieldset">
                    <RadioGroup aria-label="position" name="position" value={widget} onChange={handleWidgetChange} row>
                      <WidgetSelector value="slider" label="Slider"/>
                      <WidgetSelector value="radio" label="Radio"/>
                    </RadioGroup>
                  </FormControl>
                  {widget === 'slider' 
                  ? <div>
                      <SliderSetting id="min" label="Minimum value" type="number" handleSlider={(e) => 
                          handleSlider(e.target.value, 'minValue')} styles={classes.numField} />
                      <SliderSetting id="max" label="Maximum value" type="number" handleSlider={(e) => 
                          handleSlider(e.target.value, 'maxValue')} styles={classes.numField} />
                      <SliderSetting id="step" label="Step size" type="number" handleSlider={(e) => 
                          handleSlider(e.target.value, 'stepSize')} styles={classes.numField} />
                      <SliderSetting id="captionSlider" label="Description" type="text" handleSlider={(e) => 
                          handleSlider(e.target.value, 'caption')} styles={classes.textField} />
                    </div>
                  : <div>
                        <ChipInput style={{marginBottom:'3%'}}
                          onChange={(chips) => handleSlider(chips, 'options')}
                          placeholder="Type and enter at least two options"
                        />
                        <SliderSetting id="captionRadio" label="Description" type="text" handleSlider={(e) => 
                            handleSlider(e.target.value, 'caption')} styles={classes.textField} />
                    </div>
                  }
                      <Button variant="contained" color="primary"
                        onClick={addParameter}
                      >
                        Add paramater
                      </Button>
                      <Button variant="contained" color="primary" style={{marginLeft:'5%'}}
                        onClick={showPreview}
                      >
                        Preview
                      </Button>
                </div>
              : ''}
              <div className={classes.actionsContainer} style={{ marginTop: '5%' }}>
                <Button className={classes.button}
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  >
                  Back
                </Button>
                <Button variant="contained" color="primary" className={classes.button}
                  onClick={handleNext}
                  disabled={disabled}
                  >
                  {activeStep === steps.length - 1 ? 'Save binding' : 'Next'}
                </Button>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - Feel free to create another binding</Typography>
          <Button onClick={handleReset} className={classes.button} variant="contained" color="primary">
            Create another binding
          </Button>
          <Button onClick={saveErc} className={classes.button} variant="contained" color="primary">
            Save and go to ERC
          </Button>
        </Paper>
      )}
    </div>
  );
}

class Bindings extends Component {
  constructor ( props ) {
      super ( props );
      this.state = {
        metadata:props.metadata,
        creationStep:0,
        bindings: [],
        codeview:true,
        tmpCompId: props.compendium_id,
        tmpComputResult: {},
        tmpParam: '',
        tmpParams: [],
        tmpCodelines: '',
        tmpPlotFunction: '',
        tmpFile: props.metadata.mainfile,
        tmpBinding: '',
        figures:'',
      }
      this.getFakeData = this.getFakeData.bind(this);
    }

  componentDidMount () {
    this.getFakeData();
    this.extractR();
  }

  extractR () {
    const self=this;
    httpRequests.getCodelines({id: this.state.tmpCompId, file: this.state.tmpFile})
      .then(function(res){
        console.log(res)
        let codeBlocks = res.data.data; 
        const codeJSON = [];
        let functions = []
        for( var codeBlock of codeBlocks){
          try{
            functions= functions.concat(self.searchFunction(codeBlock));
            const code = codeBlock.join('\n') + '\n';
            codeJSON.push(RParse(code));
          }
          catch(e){
            console.log(e)
          }

        }
        const bindingsCode = [];
        console.log(codeJSON)
        console.log(functions)
        for(var fun of functions){
          const code = slice(codeJSON[0], { items: [{ first_line: parseInt(fun.line) +1, first_column: fun.firstIndex, last_line: parseInt(fun.line) +1, last_column: parseInt(fun.lastIndex) +1 }] })
          const codelines= self.handleAlogrithmusErrors(codeJSON[0].code, code.items);
          self.optimizeCodelines(codelines);
          console.log(codelines)
          bindingsCode.push(code)
        }
       console.log(bindingsCode)
      })
  }

  handleAlogrithmusErrors = (code, codelines) => {
    for(var codeItem  of code){
      switch (codeItem.type){
        case "call" : {
            if(codeItem.func.id == "par"){
              codelines.push(codeItem.location)
            }
            break;
        }
        case "if" : {
          for(var line of codelines){
            if(line.first_line > codeItem.location.first_line && line.last_line < codeItem.location.last_line){
              codelines.push(codeItem.location);
              break;
            }
          }
        }
        case "import": {
            codelines.push(codeItem.location)
        }
        }
      }
      return codelines;
    }

    optimizeCodelines = (codelines)=> {
      codelines.sort(function(a,b){
        return a.first_line - b.first_line;
      })
      for(var i=0; i<codelines.length-1; i++){
        if(codelines[i].first_line <= codelines[i+1].first_line && codelines[i].last_line >= codelines[i+1].last_line){
          codelines.splice(i+1, 1)
          i--;
        }
        else if(codelines[i].last_line === codelines[i+1].first_line || codelines[i].last_line+1 === codelines[i+1].first_line){
          codelines.splice(i,2, {first_line: codelines[i].first_line, last_line: codelines[i+1].last_line});
          i--;
        }
      }
    }

  searchFunction (code) {
    const results = [];
    const regex= /plotFigure\d*\(\)/g

    for(var i in code){
      const begin = code[i].search(regex);
      if(begin !=-1){
        const end= code[i].indexOf(')', begin)
        results.push({line: i, firstIndex: begin, lastIndex: end})
      }
    }
    console.log(results)
    return results;
  }

  getFakeData () {
    let title = this.state.metadata.title;
    let figures = [];
    fakeBindings.forEach(element => {
      if ( element.title === title ) {
        figures.push(element)
      }
    });
    this.setState({
      figures:figures,
    });
  }

  setResult ( result ) {
    if (result.indexOf("Figure") >= 0) {
      let state = this.state;
      state.tmpComputResult = {
        type: 'figure',
        result: result,
      }
      let codelines = '';
      let figures = this.state.figures;
      for(let i=0;i<figures.length;i++){
        if (figures[i].figure === result){
          //state.tmpCodelines=figures[i].lines
        }
      }
      this.setState(state);
    }
  }

  handleMouseUp ( e ) {
    if (this.state.creationStep === 1) {
      try {
        this.setCode(window.getSelection().getRangeAt(0).toString()); 
      } catch (error) {     
      }
    } else if (this.state.creationStep === 2) {
      this.setState({
        tmpParam: window.getSelection().getRangeAt(0).toString(),
      });
    }
  }

  setStep ( step ) {
    this.setState({
      creationStep: step
    });
  }

  setParameter ( param ) {
    let splittedParam = '';
    if (param.indexOf("<-") >= 0) {
      splittedParam = param.split("<-");
    }
    if (param.indexOf("=") >= 0) {
      splittedParam = param.split("=");
    }
    let state = this.state;
    let parameter = {
      text: param,
      name: splittedParam[0].trim(),
      val: Number(splittedParam[1].trim()),      
    }
    state.tmpParams.push(parameter);
    this.setState(state);
  }

  setCode ( code ) {
    let self = this;
    let state = this.state;
    state.tmpPlotFunction = code;
    this.setState(state, () => {
      httpRequests.getCodelines({id: state.tmpCompId, plot:state.tmpPlotFunction, file:state.tmpFile})
      .then( function ( res ) {
        self.setState({
          tmpCodelines: res.data.data.codelines
        })
      })
      .catch( function (res) {
        console.log(res)
      })
    });
  }

  setWidget ( key, val, type ) {
    let state = this.state;
    let newVal = val;
    let params = state.tmpParams;
    if (!isNaN(newVal)) {
      newVal = Number(newVal)
    }
    if (params.length>0) {
      if ( params[params.length-1].uiWidget === undefined ){
        params[params.length-1].uiWidget = {};
      }
      params[params.length-1].uiWidget[key] = newVal;
      params[params.length-1].uiWidget.type = type;
    } else {
      if ( params[0].uiWidget === undefined ){
        params[0].uiWidget = {};
      }
      params[0].uiWidget[key] = newVal;
      params[params.length-1].uiWidget.type = type;
    }   
    this.setState(state);
  }

  createBinding () {
    let binding = {
      "id": this.state.tmpCompId,
      "computationalResult": this.state.tmpComputResult,
      "sourcecode": {
        "file": this.state.tmpFile,
        "codelines": this.state.tmpCodelines,
        "parameter": this.state.tmpParams,
      }
    };
    this.setState({tmpBinding:binding});
    console.log(binding)
    return binding;
  }

  saveBinding () {
    let state = this.state;
    let binding = this.createBinding();
    state.bindings.push(binding);
    state.metadata.interaction.push(binding);
    this.setState(state);
  }

  switchCodePreview = () => this.setState({codeview:!this.state.codeview,});

  clearParam = () => this.setState({tmpParam:'',});

  saveErc = () => this.props.updateMetadata(this.state.metadata, true);

  clearBinding () {
    let state = this.state;
    state.codeview=true;
    state.tmpComputResult={};
    state.tmpParam='';
    state.tmpParams=[];
    state.tmpPlotFunction='';
    state.tmpBinding='';
    this.setState(state);
  }

  render() {
    return (
      <div className="bindingsView" style = {{marginTop:"5%"}}>
        <h3>The feature for creating interactive figures by yourself is still in its infancy. 
            Please, contact us since we are strongly interested in creating them for you: 
              <a href="mailto:o2r.team@uni-muenster.de"> o2r.team [ at ] uni-muenster [.de]</a>
        </h3>
        {this.state.codeview ?
          <div>
            <div className='codeView'
              onMouseUp={this.handleMouseUp.bind(this)}
            >
              <Sourcecode code={this.props.codefile.data} />
            </div>
          </div>
          : 
          <div>
            <h4>Preview of the interactive figure</h4>
            <div className='codeView'>
              <Manipulate bindings={[this.state.tmpBinding]} />
              <Button variant="contained" color="primary"
                onClick={this.switchCodePreview.bind(this)}
                >
                Back to code
              </Button>
            </div>
          </div>
        }
        <div className="steps">
          <VerticalLinearStepper
            setResult={this.setResult.bind(this)}
            setStep={this.setStep.bind(this)}
            setWidget={this.setWidget.bind(this)}
            switchCodePreview={this.switchCodePreview.bind(this)}
            setParameter={this.setParameter.bind(this)}
            tmpParam={this.state.tmpParam}
            tmpParams={this.state.tmpParams}
            tmpPlotFunction={this.state.tmpPlotFunction}
            createBinding={this.createBinding.bind(this)}
            clearParam={this.clearParam.bind(this)}
            saveBinding={this.saveBinding.bind(this)}
            saveErc={this.saveErc.bind(this)}
            clearBinding={this.clearBinding.bind(this)}
            figures={this.state.figures}
          />
        </div>
      </div>
    );
  }
}

export default Bindings;


/*
    getBindingJson(erc) {
        return {
            "id": erc.id,
            "computationalResult": {
                "type": "figure",
                "result": "Figure 3"
            },
            "port": 5001,
            "sourcecode": {
                "file": erc.metadata.o2r.mainfile,
                "codelines": [{"start":30,"end":424}],
                "parameter":
                    [{
                       "text":"velocity <- 0.5",
                       "name":"velocity",
                       "val":0.5,
                       "codeline":344,
                       "uiWidget":{
                          "type":"slider",
                          "minValue":0.1,
                          "maxValue":3.5,
                          "stepSize":0.1,
                          "caption":"Changing the velocity parameter affects damage costs"
                       }
                    },
                    {
                        "text":"duration <- 24",
                        "name":"duration",
                        "val":24,
                        "codeline":346,
                        "uiWidget":{
                           "type":"slider",
                           "minValue":1,
                           "maxValue":24,
                           "stepSize":1,
                           "caption":"Changing the duration parameter affects damage costs"
                        }
                     },
                     {
                        "text":"sediment <- 0.05",
                        "name":"sediment",
                        "val":0.05,
                        "codeline":345,
                        "uiWidget":{
                           "type":"slider",
                           "minValue":0.01,
                           "maxValue":1.0,
                           "stepSize":0.1,
                           "caption":"Changing the sediment parameter affects damage costs"
                        }
                     }
                    ],
                 "data":[
                    {
                       "file":"costs.csv",
                       "column":[
                          {
                             "name":"Costs",
                             "rows":"1-37"
                          }
                       ]
                    }
                 ]
            }
        }
    }
*/