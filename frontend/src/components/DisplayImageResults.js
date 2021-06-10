import React from "react";
import axios from "axios";
import { Card, Spin, Row, Col} from 'antd';

const { Meta } = Card;


class ImageResults extends React.Component {
    state = {
        key: '',
        dataList: [],
        tabList: []
    };

    onTabChange = (key, type) => {
        console.log(key, type);
        this.setState({ [type]: key });
    };

    componentDidMount() {
        axios
            .get("http://192.168.1.202:3334/api/site_image_predict")
            .then(res => {
                let cat_values = [...new Set(res.data.reduce((a, c) => [...a, c.class], []))]
                console.log('HHEHEHHEE',JSON.stringify(cat_values))
                let values = cat_values.reduce((label, item) => {
                    label[item] = []; return label}, {})
                console.log('HHEHEHHEE',JSON.stringify(values))
                for (let file of res.data) {
                    values[file.class].push(
                        <Col span={2}>
                            <Card
                                bordered = {false}
                                // style={{ width: '10%'}}
                                cover={<img alt="example" src={`http://192.168.1.202:3333${file.filepath}`}/>}
                            >
                            </Card>
                        </Col>
                        )
                }
                console.log('HHEHEHHEE',JSON.stringify(values))
                this.setState({ dataList: values, tabList: cat_values.map((label) => ({'key':label,'tab':label})), key: cat_values[0]})
                // var normalImages, diseasedImages;
                // normalImages = diseasedImages = [];
                // res.data.map((file, index) => {
                //     card = <Card
                //                 hoverable
                //                 style={{width: 240}}z
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

        return (
            <Card tabList={this.state.tabList} activeTabKey={this.state.key} onTabChange={key => { this.onTabChange(key, 'key'); }}>
                <Row gutter={12}>
                {this.state.dataList.length == 0 ?
                    <Card style={{width: '100%',
                        textAlign: 'center'}} loading={true}>
                        <Meta/>
                    </Card> :
                    <> {this.state.dataList[this.state.key]} </>
                }

                </Row>
            </Card>
        );
    }
}

export default ImageResults;
