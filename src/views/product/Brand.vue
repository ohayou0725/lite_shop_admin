<template>
  <page-header-wrapper>
    <a-card :bordered="false" v-if="selectDetail !== null">
      <a-descriptions layout="vertical">
        <a-descriptions-item label="公司简介">{{selectDetail.introduction}}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-card title="品牌商列表">
      <div slot="extra">
        <a-input-search
          style="margin-left: 16px; width: 272px;"
          placeholder="输入品牌商进行搜索"
          enter-button
          @search="clickSearch"
          v-model="searchKey"
        />
      </div>
      <div class="operate">
        <a-button type="dashed" style="width: 100%" icon="plus" @click="clickAdd">新增品牌商</a-button>
      </div>
      <a-list size="large" :pagination="pagination" :loading="loading">
        <a-list-item :key="index" v-for="(item, index) in list">
          <a-list-item-meta :description="item.abbreviation">
            <a-avatar slot="avatar" size="large" shape="square" :src="item.logo" />
            <a slot="title" @click="clickDetail(item)">{{ item.name }}</a>
          </a-list-item-meta>
          <div slot="actions">
            <a @click="editBrand(item)">编辑</a>
            <a-divider type="vertical" />
            <a @click="deleteBrand(item)">删除</a>
          </div>
          <div class="list-content">
            <div class="list-content-item">
              <!-- <span>产品分类</span> -->
              <div style="width: 240px">
                <a-tag
                  :closable="item.categoryList.length > 1"
                  @close="(e)=>closeTag(category,item,e)"
                  v-for="(category ,index ) in item.categoryList"
                  color="blue"
                  :key="index"
                >{{category.name}}</a-tag>

                <a-tag
                  style="background: #fff; borderStyle: dashed; cursor:pointer"
                  @click="showTree(item)"
                >
                  <a-icon type="plus" />添加分类
                </a-tag>
              </div>
            </div>
            <div class="list-content-item">
              <span>加入时间</span>
              <p>{{ item.joinTime }}</p>
            </div>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
    <a-modal v-model="visible" :title="modalTitle" :destroyOnClose="true" @ok="handleSubmit">
      <a-form @submit="handleSubmit" :form="form">
        <a-form-item label="品牌商名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['name', {rules:[{required: true, message: '请输入品牌商名称'}]}]" />
        </a-form-item>
        <a-form-item label="分类图片" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            :fileList="fileList"
            list-type="picture"
            :beforeUpload="checkFile"
            :action="uploadUrl"
            :headers="header"
            @change="afterUpload"
            :file-list="fileList"
            v-decorator="['logo', {rules:[{required: this.isAdd, message: '必须上传一张logo'}]}]"
          >
            <a-button v-if="fileList.length<1">
              <a-icon type="upload" />上传
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="品牌简介" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea
            v-decorator="['introduction', {rules:[{required: true, message: '请输入品牌简介'}]}]"
          />
        </a-form-item>
        <a-form-item label="所属分类" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="isAdd">
          <a-tree-select
            v-decorator="['categoryIds', {rules:[{required: true, message: '请选择所属分类'}]}]"
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
            allow-clear
            multiple
            treeCheckable
            :treeData="cateTree"
            :replaceFields="fields"
          ></a-tree-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model="tagvisible" title="添加分类" :destroyOnClose="true" @ok="handleAddCategory">
      <a-tree
        :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
        :treeData="cateTree"
        :replaceFields="fields"
        @select="(selectKeys,e)=>{this.selectItem.categoryId = selectKeys[0]}"
      ></a-tree>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import { getBrandList, add, addCategory, deleteCategory, updateBrand, deleteBrand } from '@/api/brand'
import { cutString } from '@/utils/util'
import { getTree } from '@/api/category'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { notification } from 'ant-design-vue'
import TrendVue from '@/components/Trend/Trend.vue'

export default {
  name: 'Brand',
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
      selectDetail: null,
      form: this.$form.createForm(this),
      list: [],
      cateTree: [],
      queryParam: {
        size: 10,
        page: 1,
      },
      brand: {},
      loading: false,
      searchKey: '',
      isAdd: false,
      title: '',
      uploadImg: '',
      visible: false,
      fileList: [],
      tagvisible: false,
      selectItem: {
        brandId: null,
        categoryId: null,
      },
      selectBrandId : null,
      haveCategorys: [],
      fields: {
        children: 'children',
        title: 'name',
        key: 'id',
        value: 'id',
        selectable: 'selectable',
      },
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
          this.getData(this.queryParam)
        },
        onChange: (current, size) => {
          this.pagination.defaultCurrent = current
          this.pagination.defaultPageSize = size
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.getData(this.queryParam)
        },
      },
    }
  },
  computed: {
    modalTitle: function () {
      return this.isAdd === true ? '添加品牌商' : '修改品牌商'
    },
  },
  created() {
    this.getData()
  },
  methods: {
    clickAdd() {
      this.isAdd = true
      this.visible = true
      getTree().then((res) => {
        if (res.success) {
          let tree = res.data.tree
          this.setNodeCheckable(tree)
          this.cateTree = tree
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
      })
    },
    afterUpload({ file, fileList }) {
      this.fileList = fileList
      //   if (file.status === 'done') {
      //     this.uploadImg = file.response.data.url
      //   }
    },
    deleteBrand(item) {
        const that = this
        this.$confirm({
        title: '确认删除',
        content: (h) => <div style="color:red;">确认是否删除该品牌商?</div>,
        onOk() {
          deleteBrand(item.id).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '删除品牌商成功',
              })
              that.getData()
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
        onCancel() {},
        calss: 'test',
      })
    },
    editBrand(item) {
      this.isAdd = false
      this.visible = true
      this.selectBrandId = item.id
      this.$nextTick(() => {
        this.form.setFieldsValue({
          name: item.name,
          introduction: item.introduction,
        })
      })
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
    showTree(item) {
      this.haveCategorys = item.categoryList
      this.tagvisible = true
      this.selectItem.brandId = item.id
      getTree().then((res) => {
        if (res.success) {
          let tree = res.data.tree
          this.setNodeSelectable(tree)
          this.cateTree = tree
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
      })
    },
    handleAddCategory() {
      if (this.selectItem.categoryId === null) {
        notification.error({
          message: '错误',
          description: '还未选择分类',
        })
      } else if (this.categoryExist(this.selectItem.categoryId)) {
        notification.error({
          message: '错误',
          description: '该分类已存在，不能重复添加',
        })
      } else {
        addCategory(this.selectItem).then((res) => {
          if (res.success) {
            notification.success({
              message: '成功',
              description: '添加分类成功',
            })
            this.getData()
            this.tagvisible = false
          } else {
            notification.error({
              message: '错误',
              description: res.msg,
            })
          }
        })
      }
    },
    clickSearch() {
      this.queryParam.name = this.searchKey
      this.getData()
      this.selectDetail = null
    },
    clickDetail(item) {
      this.selectDetail = item
    },
    closeTag(category, item, e) {
      e.preventDefault()
      const that = this
      this.$confirm({
        title: '确认删除',
        content: (h) => <div style="color:red;">确认是否删除该分类?</div>,
        onOk() {
          const param = { brandId: item.id, categoryId: category.id }
          deleteCategory(param).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '删除分类成功',
              })
              that.getData()
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
        onCancel() {},
        calss: 'test',
      })
    },

    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        if (this.fileList.length > 0) {
          values.logo = this.getImgUrl(values.logo.file)
        }
        if (this.isAdd) {
          add(values).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '添加成功',
              })
              this.visible = false
              this.getData()
            } else {
              notification.error({
                message: '错误',
                description: res.msg,
              })
            }
          })
        } else {
          values.id = this.selectBrandId
          updateBrand(values).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '修改成功',
              })
              this.visible = false
              this.getData()
            } else {
              notification.error({
                message: '错误',
                description: res.msg,
              })
            }
          })
        }
      })
    },
    getData() {
      this.loading = true
      getBrandList(this.queryParam).then((res) => {
        if (res.success) {
          this.list = res.data.page.list
          for (let i = 0; i < this.list.length; i++) {
            this.list[i].abbreviation = cutString(this.list[i].introduction, 45)
          }
          this.pagination.total = res.data.page.totalCount
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
        this.loading = false
      })
    },
    setNodeCheckable(tree) {
      if (tree != null) {
        for (let i = 0; i < tree.length; i++) {
          if (tree[i].level === 2) {
            tree[i].disableCheckbox = false
          } else {
            tree[i].disableCheckbox = true
            this.setNodeCheckable(tree[i].children)
          }
        }
      }
    },
    setNodeSelectable(tree) {
      if (tree != null) {
        for (let i = 0; i < tree.length; i++) {
          if (tree[i].level === 2) {
            tree[i].selectable = true
          } else {
            tree[i].selectable = false
            this.setNodeSelectable(tree[i].children)
          }
        }
      }
    },
    getImgUrl(file) {
      return file.response.data.url
    },
    categoryExist(cateId) {
      const cateArr = this.haveCategorys.filter((category) => {
        return category.id === cateId
      })
      return cateArr.length > 0
    },
  },
}
</script>

<style lang="less" scoped>
.ant-avatar-lg {
  width: 48px;
  height: 48px;
  line-height: 48px;
}
// .ant-list-item-meta-content{
//     margin-right : 40px !important
// }

.list-content-item {
  color: rgba(0, 0, 0, 0.45);
  display: inline-block;
  vertical-align: middle;
  font-size: 14px;
  margin-left: 40px;
  margin-right: 40px;
  span {
    line-height: 20px;
  }
  p {
    margin-top: 4px;
    // margin-left: 0px;
    margin-bottom: 0;
    // margin-right :5px;
    line-height: 22px;
  }
}
</style>