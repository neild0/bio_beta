import React from "react";
import { Text, StyleSheet } from 'react-native';
import axios from "axios";
import { Card, Spin, Row, Col, Progress, Divider} from 'antd';

const { Meta } = Card;


class ImageResults extends React.Component {
    state = {
        key: 'LCL',
        display: null,
        main:null,
        MS: null,
        SS3: null,
        LCL: null,
        tabList : [
                {
                    key: 'LCL',
                    tab: 'LCL',
                },
                {
                    key: 'MS',
                    tab: 'MS',
                },
                {
                    key: 'SS3',
                    tab: 'SS3',
                }
        ]
    };

    onTabChange = (key, type) => {
        this.setState({ [type]: key });
    };

    componentDidMount() {
        axios
            .get("http://192.168.1.202:3334/api/site_protTrans")
            .then(res => {
                this.setState({ main: res.data.main, MS: res.data.MS, SS3: res.data.SS3, LCL: res.data.LCL})
                const sortable = res.data.LCL[0].sort(function(a, b) {
                    return b.score - a.score;
                });

                const sortable2 = res.data.MS[0].sort(function(a, b) {
                    return b.score - a.score;
                });
                console.log(JSON.stringify(res.data.LCL[0]))
                console.log(JSON.stringify(sortable))
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

                const contentList = {
                    LCL: [],
                    MS: [],
                    SS3: []
                };
                for (let i = 0; i < 5; i++) {
                    contentList.LCL.push(
                        <Row span={30}>
                            <Progress percent={Number((sortable[i].score * 100).toFixed(0))} status="active" />
                            {sortable[i].label}
                        </Row>
                    )
                }

                for (let i = 0; i < sortable2.length; i++) {
                    contentList.MS.push(
                        <Row span={30}>
                            <Progress percent={Number((sortable2[i].score * 100).toFixed(0))} status="active" />
                            {sortable2[i].label}
                        </Row>
                    )
                }
                let aa_colors = {
                    'E': '#eb6a1a',
                    'H': '#5f59ff',
                    'C': '#12b0b5'
                }
                contentList.SS3.push( <> <Text style={{color: '#5f59ff'}}> Alpha-Helix - </Text>
                                        <Text style={{color: '#eb6a1a'}}> Beta-Sheet - </Text>
                                    <Text style={{color: '#12b0b5'}}> Coil </Text> <Divider /> </> )
                for (let i = 1; i < res.data.SS3.length-1; i++) {
                    contentList.SS3.push(
                        <Text style={{color: aa_colors[res.data.SS3[i].entity]}}>{res.data.SS3[i].word}</Text>
                    )
                }

                this.setState({ display: contentList})
                console.log(JSON.stringify(contentList.SS3))
            })
            .catch(err=>{
            });
    };

    render() {

        return (<>
                {this.state.display!=null ?
                    <Card tabList={this.state.tabList} activeTabKey={this.state.key} onTabChange={key => {this.onTabChange(key, 'key');}}>
                        {this.state.display[this.state.key]}
                    </Card> :
                    <Card style={{width: '100%', textAlign: 'center'}} loading={true}>
                    </Card>
                }
          </>
        );
    }
}

export default ImageResults;
