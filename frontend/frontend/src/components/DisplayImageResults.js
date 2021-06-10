import React from "react";
import axios from "axios";
import { Card, Spin, Row, Col} from 'antd';

const { Meta } = Card;


class ImageResults extends React.Component {
    state = {
        key: '',
        dataList: 0,
        cat_values: []
    };

    onTabChange = (key, type) => {
        console.log(key, type);
        this.setState({ [type]: key });
    };

    componentDidMount() {
        axios
            .get("http://192.168.1.202:3334/api/site_image_predict")
            .then(res => {
                console.log(JSON.stringify(this.state.dataList.data))
                class_vals =
                this.setState({ dataList: res.data, cat_values: [...new Set(res.data.reduce((a, c) => [...a, c.class], []))]})
                console.log(JSON.stringify(this.state.cat_values))
                // var normalImages, diseasedImages;
                // normalImages = diseasedImages = [];
                // res.data.map((file, index) => {
                //     card = <Card
                //                 hoverable
                //                 style={{width: 240}}
                //                 cover={<img alt="example" src={`http://192.168.1.202:3333${file.filepath}`}/>}
                //             >
                //             <Meta title={file.classification}/>
                //             </Card>
                //
                //     if file.classification
                //     normalImages.push()
                //
                // }
                // const contentList = {
                //     tab1: <p>content1</p>,
                //     tab2: <p>content2</p>,
                // };
            })
            .catch(err=>{
            });
    };

    render() {
        const values = this.state.cat_values.map((label) => ({label:[]}))
        for (let file of this.state.dataList):
            values[file.class].push(file.filename)
        return (
            <Card title="Results">
                <Row gutter={12}>
                <> {this.state.dataList == 0 ?
                    <Card style={{width: '100%',
                        textAlign: 'center'}} loading={true}>
                        <Meta/>
                    </Card> :
                    this.state.dataList.map((file, index) => {
                        return (
                            <Col span={2}>
                                <Card
                                    bordered = {false}
                                    // style={{ width: '10%'}}
                                    cover={<img alt="example" src={`http://192.168.1.202:3333${file.filepath}`}/>}
                                >
                                </Card>
                            </Col>)

                    })
                }
                </>
                </Row>
            </Card>
        );
    }
}

export default ImageResults;
