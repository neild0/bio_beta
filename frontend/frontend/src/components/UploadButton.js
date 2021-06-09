import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import {css, jsx} from "@emotion/react";
import axios from 'axios';

import {Upload, Progress, Button} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import uploadLogo from "../uploadData.png";
import { UploadProps } from "antd/lib/upload/interface";

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
        .post("http://192.168.1.202:3333/api/image_data", fmData, config)
        .then(res => {
            onSuccess(file);
            console.log(res);
        })
        .catch(err=>{
            const error = new Error('Some error');
            onError({event:error});
        });
}


const props: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    progress: {
        strokeColor: {
            '0%': '#108ee9',
            '100%': '#87d068',
        },
        strokeWidth: 3
    },
    directory: true,
    customRequest: UploadImage,
    accept: 'image/*',
    showUploadList: false,
    multiple: true,
    onChange({file, fileList}) {
        if (file.status !== "uploading") {
            console.log(file, fileList);
        }
    },
    defaultFileList: [
        {
            uid: "1",
            name: "xxx.png",
            status: "done",
            response: "Server Error 500", // custom error message to show
            url: "http://www.baidu.com/xxx.png",
        },
        {
            uid: "2",
            name: "yyy.png",
            status: "done",
            url: "http://www.baidu.com/yyy.png",
        },
        {
            uid: "3",
            name: "zzz.png",
            status: "error",
            response: "Server Error 500", // custom error message to show
            url: "http://www.baidu.com/zzz.png",
        },
    ],
};

// const handleOnChange = ({ file, fileList, event }) => {
//     console.log(file, fileList, event);
//     //Using Hooks to update the state to the current filelist
//     setDefaultFileList(fileList);
//     //filelist - [{uid: "-1",url:'Some url to image'}]
// };

function uploadButton() {
    return (
        <Upload {...props}>
            <img src={uploadLogo} width={200}></img>
        </Upload>
    );
}

export default uploadButton;

{
    /* <Upload {...props}>
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload> */
}
