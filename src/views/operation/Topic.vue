<template>
  <page-header-wrapper>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="专题标题">
              <a-input placeholder="专题标题" v-model="queryParam.title" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="专题子标题">
              <a-input placeholder="专题子标题" v-model="queryParam.subtitle" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="上线状态">
              <a-select placeholder="请选择" v-model="queryParam.isShow" allowClear>
                <a-select-option value="1">已上线</a-select-option>
                <a-select-option value="0">未上线</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24" :offset="16">
            <span
              class="table-page-search-submitButtons"
              :style="{ float: 'right', overflow: 'hidden' }"
            >
              <a-button type="primary" icon="plus" @click="addTopic">添加</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="query">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => {this.queryParam = {}}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-table
      :dataSource="list"
      :loading="loading"
      :columns="columns"
      rowKey="id"
      :pagination="pagination"
    >
      <template slot="img" slot-scope="text,record">
        <img :src="text" alt="点击放大预览" preview="0" style="width:120px;height:60px" />
      </template>
      <template slot="isShow" slot-scope="text,record">
        <a-switch :checked="text==1" @click="change(record)"></a-switch>
      </template>
      <template slot="position" slot-scope="text,record">
        <span v-if="text==0">首页轮播图</span>
        <span v-else>精选专场</span>
      </template>
      <template slot="action" slot-scope="text,record">
        <a @click="openDetail(record)">专题详情</a>
        <a-divider type="vertical" />
        <a @click="getDetail(record)">商品详情</a>
        <a-divider type="vertical" />
        <a @click="editTopic(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="deleteTopic(record)">删除</a>
      </template>
    </a-table>
    <a-drawer title="专题商品" :visible="drawerVisible" width="600" @close="()=>drawerVisible=false">
      <a-button icon="plus" type="primary" @click="openAddGoods">添加商品</a-button>
      <a-list item-layout="horizontal" :dataSource="currentGoodsList">
        <a-list-item slot="renderItem" slot-scope="item,index">
          <a-button
            icon="delete"
            type="danger"
            size="small"
            shape="round"
            slot="actions"
            @click="removeGoods(item)"
          ></a-button>
          <a-list-item-meta :description="item.brief">
            <a-avatar slot="avatar" :size="60" :src="item.titleImg" />
            <a slot="title">{{item.title}}</a>
          </a-list-item-meta>
          <div>￥{{item.price}}</div>
        </a-list-item>
      </a-list>
    </a-drawer>
    <a-modal
      v-model="visible"
      title="添加商品"
      :footer="null"
      @afterClose="closeModal"
      :destroyOnClose="true"
    >
      <a-input-group compact>
        <a-select v-model="goodsPram">
          <a-select-option value="goodsSn">商品编号</a-select-option>
          <a-select-option value="name">商品名称</a-select-option>
        </a-select>
        <a-input-search
          style="width: 200px"
          placeholder="搜索"
          @search="searchGoods"
          v-model="goodsQueryValue"
        />
      </a-input-group>
      <a-list item-layout="horizontal" :dataSource="goodsList">
        <a-list-item slot="renderItem" slot-scope="item,index">
          <a-button
            icon="plus"
            type="primary"
            size="small"
            shape="round"
            slot="actions"
            @click="addGoods(item)"
          ></a-button>
          <a-list-item-meta :description="item.brief">
            <a-avatar slot="avatar" :size="60" :src="item.titleImg" />
            <a slot="title">{{item.title}}</a>
          </a-list-item-meta>
          <div>￥{{item.reservePrice}}</div>
        </a-list-item>
      </a-list>
    </a-modal>
    <a-modal
      v-model="addVisible"
      :title="title"
      :destroyOnClose="true"
      @ok="submitForm"
      @afterClose="()=>detailCache=null"
    >
      <a-form :form="form">
        <a-form-item label="专题标题" :labelCol="labelCol" :wrapperCol="wrapperCol" required has-feedback>
          <a-input
            v-decorator="['title', 
          { initialValue: isEdit ? selectTopic.title : '' },
          {rules:[{required: true, message: '请输入专题标题'},
          ]
          }]"
          />
        </a-form-item>
        <a-form-item label="专题子标题" :labelCol="labelCol" :wrapperCol="wrapperCol" required has-feedback>
          <a-input
            v-decorator="['subtitle',
          { initialValue: isEdit ? selectTopic.subtitle : '' },
           {rules:[{required: true, message: '请输入专题子标题'}]}]"
          />
        </a-form-item>
        <a-form-item label="专题图片" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            :fileList="fileList"
            list-type="picture-card"
            :beforeUpload="checkFile"
            :action="uploadUrl"
            :headers="header"
            @change="afterUpload"
            v-decorator="['imgs', 
            {rules:[{required: isEdit ? false:true, message: '必须上传一张专题图片'}]}]"
          >
            <div v-if="fileList < 1">
              <a-icon :type="loading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="显示位置" :labelCol="labelCol" :wrapperCol="wrapperCol" required help="如精选专场已有专题，则会替换当前专题">
          <a-radio-group 
          v-decorator="['position', 
          { initialValue: isEdit ?  selectTopic.position :0 },
          {rules:[{required: true, message: '必须设置显示位置'}]}]">
            <a-radio :value="0">
                首页轮播图
            </a-radio>
            <a-radio :value="1">
                精选专场
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="排序号" :labelCol="labelCol" :wrapperCol="wrapperCol" required has-feedback>
          <a-input-number
            v-decorator="['sort', 
          { initialValue: isEdit ? selectTopic.sort : 0 },
          {rules:[{required: true, message: '必须设置排序号'}]}]"
          ></a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model="detailVisible" width="800" title="专题详情" :footer="null" :destroyOnClose="true">
      <a-button
        type="primary"
        style="margin-bottom:20px;text-align: right"
        v-if="!editDetail"
        @click="clickEdit()"
      >编辑</a-button>
      <div v-else style="text-align: center">
        <a-button
          type="primary"
          style="margin-bottom:20px;margin-right:10px;"
          @click="editContent"
        >确定</a-button>
        <a-button type="danger" style="margin-bottom:20px;" @click="cancelEdit">取消</a-button>
      </div>
      <div v-html="detail" v-if="!editDetail"></div>
      <a-empty v-if="disabled" />
      <WangEditor v-if="editDetail" v-model="detail"></WangEditor>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import {
  getTopicList,
  changeShow,
  getDetail,
  removeGoods,
  addGoods,
  addTopic,
  editContent,
  deleteTopic,
  editTopic,
} from '@/api/topic'
import { notification } from 'ant-design-vue'
import { getSpuList } from '@/api/goods'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import WangEditor from '@/components/Editor/WangEditor'

export default {
  name: 'Topic',
  components: { WangEditor },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_API_BASE_URL + '/product/brand/upload',
      header: {
        Authorization: window.sessionStorage.getItem(ACCESS_TOKEN),
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
      },
      list: [],
      detail: '',
      fileList: [],
      editDetail: false,
      queryParam: {},
      loading: false,
      currentGoodsList: [],
      goodsList: [],
      drawerVisible: false,
      selectTopic: {},
      visible: false,
      addVisible: false,
      goodsPram: 'goodsSn',
      goodsQueryValue: '',
      detailVisible: false,
      disabled: true,
      detailCache: null,
      isEdit: false,
      form: this.$form.createForm(this),

      columns: [
        {
          title: '序号',
          align: 'center',
          width: '40px',
          customRender: (value, row, index) => {
            return `${(this.pagination.defaultCurrent - 1) * this.pagination.defaultPageSize + index + 1}`
          },
        },
        {
          title: '专题标题',
          dataIndex: 'title',
          align: 'center',
        },
        {
          title: '专题子标题',
          dataIndex: 'subtitle',
          align: 'center',
        },

        {
          title: '专题图片',
          dataIndex: 'imgs',
          align: 'center',
          scopedSlots: { customRender: 'img' },
        },

        {
          title: '排序',
          dataIndex: 'sort',
          align: 'center',
        },
        {
          title: '上线状态',
          dataIndex: 'isShow',
          align: 'center',
          scopedSlots: { customRender: 'isShow' },
        },
        {
          title: '显示位置',
          dataIndex: 'position',
          align: 'center',
          scopedSlots: { customRender: 'position' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      pagination: {
        defaultCurrent: 1,
        defaultPageSize: 10,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total) => `共${total}条记录`,
        onShowSizeChange: (current, pageSize) => {
          this.pagination.defaultCurrent = 1
          this.pagination.defaultPageSize = pageSize
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.queryData(this.queryParam)
        },
        onChange: (current, size) => {
          this.pagination.defaultCurrent = current
          this.pagination.defaultPageSize = size
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.queryData(this.queryParam)
        },
      },
    }
  },

  created() {
    this.queryData(this.queryParam)
  },
  computed: {
    title() {
      return this.isEdit ? '编辑专题' : '新增专题'
    },
  },
  methods: {
    query() {
      this.queryData(this.queryParam)
      
    },
    change(record) {
      const newIsShow = 1 - record.isShow
      const param = { isShow: newIsShow, id: record.id }
      const that = this
      this.$confirm({
        content: '确认是否更改该专题上线状态?',
        onOk() {
          changeShow(param).then((res) => {
            if (res.success) {
              record.isShow = newIsShow
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    editTopic(record) {
      this.addVisible = true
      this.isEdit = true
      this.selectTopic = record
    },
    addTopic() {
      this.addVisible = true
      this.isEdit = false
    },
    openDetail(record) {
      this.detailVisible = true
      this.detail = record.content
      this.selectTopic = record
      if (this.detail) {
        this.disabled = false
      }
    },
    getDetail(record) {
      this.drawerVisible = true
      this.selectTopic = record
      getDetail(record.id).then((res) => {
        if (res.success) {
          this.currentGoodsList = res.data.list
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    removeGoods(item) {
      const param = {
        id: this.selectTopic.id,
        goodsList: [{ id: item.id }],
      }
      const that = this
      this.$confirm({
        content: '是否移除该商品?',
        onOk() {
          removeGoods(param).then((res) => {
            if (res.success) {
              that.getDetail(that.selectTopic)
              notification.success({
                message: '成功',
                description: '移除商品成功',
              })
              that.$forceUpdate()
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    openAddGoods() {
      this.visible = true
    },
    deleteTopic(record) {
      const that = this

      this.$confirm({
        content: '确认是否删除该专题，删除后将无法恢复?',
        onOk() {
          deleteTopic(record.id).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '删除专题成功',
              })
              that.queryData(that.queryParam)
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    searchGoods() {
      let param = null
      if (this.goodsPram == 'name' && this.goodsQueryValue !== '') {
        param = { name: this.goodsQueryValue }
      } else if (this.goodsPram == 'goodsSn' && this.goodsQueryValue !== '') {
        param = { goodsSn: this.goodsQueryValue }
      }
      if (param) {
        getSpuList(param).then((res) => {
          if (res.success) {
            this.goodsList = res.data.list.list
          } else {
            notification.error({
              message: '失败',
              description: res.msg,
            })
          }
        })
      }
    },
    addGoods(item) {
      let param = {
        id: this.selectTopic.id,
        goodsList: [{ id: item.id }],
      }
      addGoods(param).then((res) => {
        if (res.success) {
          this.getDetail(this.selectTopic)
          this.visible = false
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    queryData(params) {
      this.loading = true
      getTopicList(params).then((res) => {
        if (res.success) {
          this.list = res.data.page.list
          this.pagination.defaultCurrent= res.data.page.currPage
          this.pagination.defaultPageSize = res.data.page.pageSize
          this.pagination.total = res.data.page.totalCount
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      this.loading = false
      })
    },
    submitForm() {
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        if (this.fileList.length > 0) {
          values.imgs = values.imgs.file.response.data.url
        }
        if (this.isEdit) {
          values.id = this.selectTopic.id
          editTopic(values).then((res) => {
            if (res.success) {
              this.fileList = []
              this.addVisible = false
              notification.success({
                message: '成功',
                description: res.msg,
              })
              this.queryData(this.queryParam)
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        } else {
          addTopic(values).then((res) => {
            if (res.success) {
              this.fileList = []
              this.addVisible = false
              notification.success({
                message: '成功',
                description: res.msg,
              })
              this.queryData(this.queryParam)
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        }
      })
    },
    clickEdit() {
      this.editDetail = true
      this.detailCache = this.detail
    },
    cancelEdit() {
      this.detail = this.detailCache
      this.editDetail = false
    },
    editContent() {
      let param = {
        id: this.selectTopic.id,
        content: this.detail,
      }
      editContent(param).then((res) => {
        if (res.success) {
          notification.success({
            message: '成功',
            description: '修改成功',
          })
          this.editDetail = false
          this.queryData(this.queryParam)
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    closeModal() {
      this.goodsList = []
      this.goodsQueryValue = ''
    },
    afterUpload({ file, fileList }) {
      this.fileList = fileList
    },
    checkFile(file) {
      const sizeOk = file.size < 1024 * 300
      const start = file.type.indexOf('image')
      const typeOk = start >= 0

      return new Promise((resolve, reject) => {
        if (!typeOk) {
          this.$message.error('照片格式有误！')
          reject(file)
        } else if (!sizeOk) {
          this.$message.error('照片大小超过300K！')
          reject(file)
        } else {
          resolve(file)
        }
      })
    },
  },
}
</script>

<style scoped>
</style>