import React, { Component } from 'react';
import { Card, TextField, Button, MenuItem, CardContent,Grid } from "@material-ui/core";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { withRouter } from 'react-router-dom';

import licensesData from '../../../helpers/licenses.json'
import Authors from './Authors/Authors';

import './requiredMetadata.css';
import { runInThisContext } from 'vm';

const textLicenses = [];
const dataLicenses = [];
const codeLicenses = [];
const mostRestrictiveData = [];
const leastRestrictiveData = [];

function prepareLicense() {

    for (var i in licensesData) {
        if (licensesData[i].domain_content) {
            textLicenses.push(licensesData[i])
        }
        ;
        if (licensesData[i].domain_data) {
            dataLicenses.push(licensesData[i])
        }
        ;
        if (licensesData[i].domain_software) {
            codeLicenses.push(licensesData[i])
        }
        ;
    }
    mostRestrictiveData.push(textLicenses[3].id);
    mostRestrictiveData.push(codeLicenses[28].id);
    mostRestrictiveData.push(dataLicenses[1].id);
    leastRestrictiveData.push(textLicenses[5].id);
    leastRestrictiveData.push(codeLicenses[39].id);
    leastRestrictiveData.push(dataLicenses[4].id);

}


const validationSchema = Yup.object({
    title: Yup.string()
        .required('Titel is required'),
    abstract: Yup.string()
        .required('Abstract is required'),
    publicationDate: Yup.date().max(new Date, 'No Valid Date')
        .required("Date is require"),
    displayFile: Yup.string()
        .required('DisplayFile is required'),
    mainFile: Yup.string()
        .required('MainFile is required'),
    textLicense: Yup.string()
        .required('License is requires'),
    codeLicense: Yup.string()
        .required('License is requires'),
    dataLicense: Yup.string()
        .required('License is requires')
});


const Form = props => {
    const {
        values: { title, abstract, publicationDate, displayFile, mainFile, textLicense, dataLicense, codeLicense },
        errors,
        touched,
        handleChange,
        isValid,
        setFieldTouched,
        setFieldValue
    } = props;

    const change = (name, e) => {
        e.persist();
        e.target.name = name;
        handleChange(e);
        setFieldTouched(name, true, false);
    };

    const blur = () => {
        props.setFieldValues(props.values);
    }

    const handleClick = (name, e) => {
        if (name === "mostRestrictive") {
            setFieldValue('textLicense', mostRestrictiveData[0]);
            setFieldValue('codeLicense', mostRestrictiveData[1]);
            setFieldValue('dataLicense', mostRestrictiveData[2]);
        } else if (name === "leastRestrictive") {
            setFieldValue('textLicense', leastRestrictiveData[0]);
            setFieldValue('codeLicense', leastRestrictiveData[1]);
            setFieldValue('dataLicense', leastRestrictiveData[2]);
        }
    };

    return (
        <form id="form" onSubmit={props.handleSubmit}>
            <br />
            <Grid container spacing={2}>
                <Grid item xs={10}>
            <Card>
                <CardContent>
                    <h4>Title</h4>
                    <TextField
                        id="title"
                        label="Required"
                        style={{ margin: 8, width: '80%' }}
                        placeholder="Title"
                        required
                        helperText={touched.title ? errors.title : ""}
                        error={touched.title && Boolean(errors.title)}
                        value={title}
                        onChange={change.bind(null, "title")}
                        onBlur={blur.bind(null)}
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }} />
            <br />
                    <h4>Abstract</h4>
                    <TextField
                        id="abstract"
                        label="Required"
                        style={{ margin: 8, width: '80%' }}
                        placeholder="Abstract"
                        required
                        multiline
                        rows={3}
                        helperText={touched.abstract ? errors.abstract : ""}
                        error={touched.abstract && Boolean(errors.abstract)}
                        value={abstract}
                        onChange={change.bind(null, "abstract")}
                        onBlur={blur.bind(null)}
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }} />
            <br />
            <Authors authors={props.authors} onUpdate={props.onUpdate}></Authors>
            <br />
                    <h4>Publication Date</h4>
                    <TextField
                        id="publicationDate"
                        label="Publication date"
                        type="date"
                        style={{ margin: 8 }}
                        required
                        helperText={touched.publicationDate ? errors.publicationDate : ""}
                        error={touched.publicationDate && Boolean(errors.publicationDate)}
                        value={publicationDate}
                        onChange={change.bind(null, "publicationDate")}
                        onBlur={blur.bind(null)}
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }} />
            <br />
                    <h4>Display File</h4>
                    <TextField
                        id="displayFile"
                        label="displayFile"
                        style={{ margin: 8, width: '20%' }}
                        placeholder="display.html"
                        required
                        select
                        helperText={touched.displayFile ? errors.displayFile : ""}
                        error={touched.displayFile && Boolean(errors.displayFile)}
                        value={displayFile}
                        onChange={change.bind(null, "displayFile")}
                        onBlur={blur.bind(null)}
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}>
                        {props.displayCandidates.map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
            <br />
                    <h4>Main File</h4>
                    <TextField
                        id="mainFile"
                        label="mainFile"
                        select
                        style={{ margin: 8, width: '20%' }}
                        placeholder="main.Rmd"
                        required
                        helperText={touched.mainFile ? errors.mainFile : ""}
                        error={touched.mainFile && Boolean(errors.mainFile)}
                        value={mainFile}
                        onChange={change.bind(null, "mainFile")}
                        onBlur={blur.bind(null)}
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}>
                        {props.mainFileCandidates.map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
            <br />
                    <h4>Licenses</h4>
                    <div>
                        <Button variant="contained" color="primary" style={{ margin: "8px" }}
                            onClick={handleClick.bind(null, "mostRestrictive")}
                        >MOST RESTRICTIVE</Button>
                        <Button variant="contained" color="primary" style={{ margin: "8px" }}
                            onClick={handleClick.bind(null, "leastRestrictive")}
                        >LEAST RESTRICTIVE</Button>
                    </div>

                    <TextField
                        id="textLicense"
                        select
                        label="Text License"
                        style={{ margin: 8, width: '30%' }}
                        required
                        helperText={touched.textLicense ? errors.textLicense : ""}
                        error={touched.textLicense && Boolean(errors.textLicense)}
                        value={textLicense}
                        onChange={change.bind(null, "textLicense")}
                        onBlur={blur.bind(null) }
                        margin="normal"
                        variant="outlined"
                    >
                        {textLicenses.map(option => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.title}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        id="codeLicense"
                        select
                        label="Code License"
                        style={{ margin: 8, width: '30%' }}
                        required
                        helperText={touched.codeLicense ? errors.codeLicense : ""}
                        error={touched.codeLicense && Boolean(errors.codeLicense)}
                        value={codeLicense}
                        onChange={change.bind(null, "codeLicense")}
                        onBlur={blur.bind(null)}
                        margin="normal"
                        variant="outlined"
                    >
                        {codeLicenses.map(option => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.title}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        id="dataLicense"
                        select
                        label="Data License"
                        style={{ margin: 8, width: '30%' }}
                        required
                        helperText={touched.dataLicense ? errors.dataLicense : ""}
                        error={touched.dataLicense && Boolean(errors.dataLicense)}
                        value={dataLicense}
                        onChange={change.bind(null, "dataLicense")}
                        onBlur={blur.bind(null)}
                        margin="normal"
                        variant="outlined"
                    >
                        {dataLicenses.map(option => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.title}
                            </MenuItem>
                        ))}
                    </TextField>
                </CardContent>
            </Card>
            </Grid>
            <Grid item xs={2} >
                <Card style={{"margin-top":"10%", position: "fixed" }}>

            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isValid || !props.authorsValid}
            >
                Save
            </Button>
            </Card>

            </Grid>
            </Grid>
            
        </form>
    )
}

class RequiredMetadata extends Component {
    constructor(props) {
        super(props);
        this.state = {
            metadata: props.metadata,
            title: props.metadata.title,
            abstract: props.metadata.description,
            publicationDate: props.metadata.publication_date,
            displayFile: props.metadata.displayfile,
            mainFile: props.metadata.mainfile,
            dataLicense: props.metadata.license.data,
            textLicense: props.metadata.license.text,
            codeLicense: props.metadata.license.code,
            displayCandidates: props.metadata.displayfile_candidates,
            mainFileCandidates: props.metadata.mainfile_candidates,
            authors: props.metadata.creators,
            authorsValid: false,
            formValues: null,
            isValid: true,
        }
    };

    componentDidMount() {
        prepareLicense();
        this.authorsNotNull();
    }

    componentWillUnmount() {

        const values = this.state.fieldValues;
        console.log(values);

        if(values!=null)
        {



        const updatedMetadata = this.props.metadata;
        updatedMetadata.title = values.title;
        updatedMetadata.description = values.abstract;
        updatedMetadata.creators = this.state.authors;
        updatedMetadata.publication_date = values.publicationDate;
        updatedMetadata.displayfile = values.displayFile;
        updatedMetadata.mainfile = values.mainFile;
        updatedMetadata.license.data = values.dataLicense;
        updatedMetadata.license.text = values.textLicense;
        updatedMetadata.license.code = values.codeLicense;
        this.props.setMetadata(updatedMetadata, true);

        }

    }

    updateAuthors = (value) => {
        this.setState({ authors: value }, () => {
            this.authorsNotNull()
        })
    }

    authorsNotNull = () => {

        let valid = true;
        if (this.state.authors.length === 0 || this.state.authors === null) {
            valid = false;
        }
        for (var i in this.state.authors) {
            if (this.state.authors[i].name === "") {
                valid = false;
            }
        }
        this.setState({ authorsValid: valid });
    };

    setFieldValues = ( values ) =>{
        this.setState({fieldValues: values})
    }

    render() {


        return (
            <div>
               
                {this.state.metadata &&
                    <Formik
                        onSubmit={(values, actions) => {

                            actions.setSubmitting(false);

                            const updatedMetadata = this.props.metadata;
                            updatedMetadata.title = values.title;
                            updatedMetadata.description = values.abstract;
                            updatedMetadata.creators = this.state.authors;
                            updatedMetadata.publication_date = values.publicationDate;
                            updatedMetadata.displayfile = values.displayFile;
                            updatedMetadata.mainfile = values.mainFile;
                            updatedMetadata.license.data = values.dataLicense;
                            updatedMetadata.license.text = values.textLicense;
                            updatedMetadata.license.code = values.codeLicense;
                            this.props.setMetadata(updatedMetadata, true);
                        }
                        }
                        render={props => <Form{...props} authors={this.state.authors}
                            displayCandidates={this.state.displayCandidates}
                            mainFileCandidates={this.state.mainFileCandidates}
                            onUpdate={this.updateAuthors}
                            authorsValid={this.state.authorsValid}
                            setFieldValues={this.setFieldValues} />}
                        initialValues={this.state}
                        validationSchema={validationSchema}
                    />
                }
            
           
            
            </div>


        );
    }
}

export default withRouter(RequiredMetadata);