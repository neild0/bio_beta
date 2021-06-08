import {Upload, Modal} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import React from "react";

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
        fileList: [
            {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: "",
            },
            {
                uid: "-2",
                name: "image.png",
                status: "done",
                url: "",
            },
            {
                uid: "-3",
                name: "image.png",
                status: "done",
                url: "",
            },
            {
                uid: "-4",
                name: "image.png",
                status: "done",
                url: "",
            },
            {
                uid: "-xxx",
                percent: 50,
                name: "image.png",
                status: "uploading",
                url: "",
            },
            {
                uid: "-5",
                name: "image.png",
                status: "error",
            },
        ],
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
