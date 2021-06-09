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

    render() {
        let dataset = axios
            .get("http://192.168.1.202:3333/api/image_data")
            .then(res => {
            })
            .catch(err=>{
            });
        console.log(dataset)
        for (let file in dataset) {
            this.setState({ fileList: [...this.state.fileList, {name: file, url: `http://192.168.1.202:3333/${file}`}]
            })
        }

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
                    directory={true}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                >
                    {fileList.length >= 100 ? null : uploadButton}
                </Upload>
                <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <img alt="example" style={{width: "100%"}} src={previewImage}/>
                </Modal>
            </>
        );
    }
}

export default PicturesWall;
