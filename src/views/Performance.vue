<template>
    <div>
        <div style="text-align: right;margin: 10px 0;">
            <a-button type="primary" @click="addModal">添加分析</a-button>
        </div>
        <div style="text-align: left">
            <div style="background:#ECECEC; padding:20px;display: inline-block;" v-for="(item,i) in data" :key="i">
                <a-card :title="item.name" :bordered="false" style="width: 300px">
                    <p>{{item.mobile}}</p>
                    <p>{{item.network}}</p>
                    <div style="text-align: left">
                        <a-button type="primary" @click="analy(item,i)">执行</a-button>
                        <span style="position: absolute;right: 20px;margin-top:5px" v-show="item.loading"> <a-spin size="large" /></span>
                        <span style="position: absolute;right: 20px;margin-top:5px" @click="see(item.id)" v-show="item.hasReport">查看报告<a-icon type="right"/></span>
                    </div>
                </a-card>
            </div>
        </div>

        <a-modal
                title="分析表单"
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
                        <a-select-option value="3G">3G</a-select-option>
                        <a-select-option value="4G">4G</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                        label="分析机型"
                        :label-col="{ span: 5 }"
                        :wrapper-col="{ span: 12 }"
                >
                    <a-input v-model="obj.mobile"/>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>
<script>
    import axios from 'axios';
    export default {
        name: 'Performance',
        data() {
            return {
                showModal: false,
                formLayout: 'horizontal',
                form: this.$form.createForm(this),
                obj: {
                    name: '',
                    url: '',
                    network: '',
                    mobile: ''
                },
                data:[]
            }
        },
        mounted(){
            this.getData();
        },
        components: {},
        methods: {
            getData(){
                axios.get('/perFormList')
                    .then(res => {
                        this.data = res.data.data;
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
                this.obj.mobile="";
                this.obj.network="";
                this.obj.url="";
            },
            handleOk() {
                axios.post('/addPerform', {
                    name: this.obj.name,
                    mobile: this.obj.mobile,
                    network: this.obj.network,
                    url: this.obj.url,
                    hasReport: false
                })
                    .then( res => {
                        this.$message.success("添加成功");
                        this.showModal = false;
                        this.obj.id=res.data.data;
                        this.data.push({...this.obj});
                        this.obj.name="";
                        this.obj.mobile="";
                        this.obj.network="";
                        this.obj.url="";
                    })
                    .catch(()=>{
                    });
            },
            analy(item,i){
                this.$set(this.data[i],"loading",true);
                axios.get('/webevaluate?network='+item.network+'&url='+item.url+'&id='+item.id)
                    .then( res => {
                        this.data[i].loading=false;
                        this.data[i].hasReport=true;
                    })
            },
            see(id){
                let href="http://localhost:3000/see?id="+id;
                window.open(href, '_blank');
                return false;
            }
        }
    }
</script>