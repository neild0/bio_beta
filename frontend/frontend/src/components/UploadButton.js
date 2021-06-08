import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import React from "react";
import { css, jsx } from "@emotion/react";

import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import uploadLogo from "../uploadData.png";

const props = {
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  onChange({ file, fileList }) {
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

function uploadButton(props) {
  return (
    <Upload {...props}>
      {" "}
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
