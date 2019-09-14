<template>
    <div>
        <div style="text-align: right;margin: 10px 0;">
            <a-button type="primary" @click="addModal">添加页面加载测试</a-button>
        </div>
        <a-table :columns="columns" :dataSource="data" bordered>
        </a-table>
        <a-modal
                title="页面加载表单"
                v-model="showModal"
                @ok="handleOk"
                @cancel="cancelOk"
        >
            <a-form
                    :form="form"
            >
                <a-form-item
                        label="分析名称"
                        :label-col="{ span: 5 }"
                        :wrapper-col="{ span: 12 }"
                >
                    <a-input v-model="obj.name"/>
                </a-form-item>
                <a-form-item
                        label="分析链接"
                        :label-col="{ span: 5 }"
                        :wrapper-col="{ span: 12 }"
                >
                    <a-input v-model="obj.url"/>
                </a-form-item>
                <a-form-item
                        label="分析环境"
                        :label-col="{ span: 5 }"
                        :wrapper-col="{ span: 12 }"
                >
                    <a-select v-model="obj.network" style="width: 100px">
                        <a-select-option value="3g">3G</a-select-option>
                        <a-select-option value="4g">4G</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>
<script>
    const columns = [{
        title: '名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
    }, {
        title: '链接',
        dataIndex: 'url',
    }, {
        title: '网络环境',
        dataIndex: 'network',
    },{
        title: 'DNS加载时长',
        dataIndex: 'dnsTime',
    },{
        title: 'TTFB加载时长',
        dataIndex: 'TTFB',
    },{
        title: 'pageDownloadTime加载时长',
        dataIndex: 'pageDownloadTime',
    },{
        title: '白屏时间',
        dataIndex: 'whiteScreenTime',
    },{
        title: 'DOM加载时长',
        dataIndex: 'DOMReadyTime',
    },{
        title: '资源下载时长',
        dataIndex: 'afterDOMReadyDownloadTime',
    },{
        title: '总共加载时间',
        dataIndex: 'loadTime',
    }];

    const data = [{
        "name": "个人主页",
        "url": "http://wx.10086.cn/website/personalHome/new/index",
        "network": "4G",
        "id": 1,
        "dnsTime": "1.00 ms",
        "tcpTime": "24.00 ms",
        "TTFB": "227.00 ms",
        "pageDownloadTime": "32.00 ms",
        "whiteScreenTime": "1.28 s",
        "DOMReadyTime": "1.39 s",
        "afterDOMReadyDownloadTime": "6.51 s",
        "loadTime": "7.87 s"
    }];
    import axios from 'axios';
    export default {
        name:'Time',
        data() {
            return {
                data,
                columns,
                showModal: false,
                formLayout: 'horizontal',
                form: this.$form.createForm(this),
                obj: {
                    name: '',
                    url: '',
                    network: '',
                },
            }
        },
        mounted(){
          this.getData();
        },
        methods: {
            getData(){
                axios.get('/timeList')
                    .then(res => {
                        if(res.data.data){
                            this.data=this.data.concat(res.data.data)
                        }
                    })
                    .catch(() => {
                        this.$message.success("添加失败");
                    })
            },
            addModal() {
                this.showModal = true;
            },
            cancelOk(){
                this.showModal = false;
                this.obj.name="";
                this.obj.network="";
                this.obj.url="";
            },
            handleOk() {
                axios.get(`/performance?url=${this.obj.url}&network=${this.obj.network}`).then( res3 => {
                    let item ={...this.obj};
                    let obj2={...item,...res3.data.data.total};
                    this.data.push(obj2);
                    axios.post('/addTime', {
                        ...obj2
                    }).then( res => {
                        this.$message.success("添加成功");
                        this.showModal = false;
                        this.obj.name="";
                        this.obj.network="";
                        this.obj.url="";
                        this.obj.id="";
                    })
                })
            },
        }
    }
</script>
<style>
</style>