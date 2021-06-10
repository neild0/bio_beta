import {Upload, Modal} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import React from "react";
import axios from "axios";

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
const UploadImage = async options => {

    const { onSuccess, onError, file, onProgress } = options;
    // const [defaultFileList, setDefaultFileList] = useState([]);
    const fmData = new FormData();
    const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: event => {
            console.log((event.loaded / event.total) * 100);
            onProgress({ percent: (event.loaded / event.total) * 100 },file);
        }
    };
    fmData.append("uploadedImages", file);
    axios
        .post("http://192.168.1.202:3333/api/protein_data", fmData, config)
        .then(res => {
            onSuccess(file);
            console.log(res);
        })
        .catch(err=>{
            const error = new Error('Some error');
            onError({event:error});
        });
    }

class PicturesWall extends React.Component {
    state = {
        previewVisible: false,
        previewImage: "",
        previewTitle: "",
        data_loc:"",
        fileList: [],
    };



    handleCancel = () => this.setState({previewVisible: false});

    handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle:
                file.name || file.url.substring(file.url.lastIndexOf("/") + 1),
        });
    };

    handleChange = ({fileList}) => this.setState({fileList});

    // componentDidMount() {
    //     axios
    //         .get("http://192.168.1.202:3333/api/protein_data")
    //         .then(dataset => {
    //             for (let file of dataset.data) {
    //                 this.setState({ fileList: [...this.state.fileList, {name: file}]
    //                 })
    //             }
    //         })
    //         .catch(err=>{
    //         });
    // };


    render() {
        const {previewVisible, previewImage, fileList, previewTitle} = this.state;
        const uploadButton = (
            <div>
                <PlusOutlined/>
                <div style={{marginTop: 8}}>Upload</div>
            </div>
        );
        return (
            <>
                <Upload
                    action='../'
                    listType="picture-card"
                    fileList={fileList}
                    customRequest={UploadImage}
                >
                    {fileList.length >= 1 ? null : uploadButton}
                </Upload>

            </>
        );
    }
}

export default PicturesWall;
