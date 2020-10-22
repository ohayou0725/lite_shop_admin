<template>
  <page-header-wrapper>
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card title="商品分类" :bordered="false">
          <div slot="extra">
            <a-button type="primary" icon="plus" size="small" shape="round" @click="clickAdd"></a-button>
            <a-popconfirm title="确定是否删除该分类？" @confirm="deleteCate">
            <a-button type="danger" icon="delete" size="small" :disabled="isDisabled" shape="round"
                      ></a-button>
            </a-popconfirm>

          </div>

          <a-tree
            checkStrictly
            :treeData="tree"
            :replaceFields="fields"
            v-model:checkedKeys="checkedKeys"
            @select="select"
            checkable>

          </a-tree>
        </a-card>
      </a-col>
      <a-col :span="18">
        <a-card title="分类详情" :bordered="false">
          <a-button :disabled="editButton" type="primary" icon="edit" slot="extra" @click="editCate">编辑</a-button>
          <a-descriptions :title="detailTitle">
            <a-descriptions-item label="分类名">
              {{selectCategory.name}}
            </a-descriptions-item>
            <a-descriptions-item label="分类级别">
              <span v-if="selectCategory.level == 0">一级分类</span>
              <span v-else-if="selectCategory.level == 1">二级分类</span>
              <span v-else-if="selectCategory.level == 2">三级分类</span>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{selectCategory.createTime}}
            </a-descriptions-item>
            <a-descriptions-item label="预览图">
              <img :src="selectCategory.img" alt="">
            </a-descriptions-item>
          </a-descriptions>
          <a-divider style="margin-bottom: 32px"/>
          <div class="title">属性列表
            <a-button class="table-add-btn"
                      @click="clickAddAttr"
                      icon="plus" :disabled="selectCategory.level != 2" type="primary">
              添加属性
            </a-button></div>
          <a-table :data-source="selectCategory.attrs" :loading="loading" :columns="columns" :pagination="false"
                   rowKey="{record=>record.id}">
          <span slot="action" slot-scope="text, record">
          <template>
              <a-button icon="edit" size="small" type="primary" shape="round" @click="editAttr(record)"></a-button>
            <a-divider type="vertical" />
            <a-popconfirm title="确定是否删除该属性？" @confirm="deleteAttr(record)">
            <a-button icon="delete" size="small" type="danger" shape="round"></a-button>
            </a-popconfirm>
          </template>
        </span>
          </a-table>

        </a-card>
      </a-col>
    </a-row>
    <a-drawer
      :title="drawerTitle"
      :visible="visible"
      @close="onClose"
      :width="480"
      :body-style="{ paddingBottom: '80px' }"
    >
      <a-form :form="form" @submit="submit">
        <a-form-item label="分类名称" :required="true" has-feedback
        >
          <a-input name="name" placeholder="分类名" v-decorator=
            "['name',{initialValue: selectCategory.name?selectCategory.name:'' ,rules:[{required:true,message:'必须输入分类名'}]}]"></a-input>
        </a-form-item>
        <a-form-item label="分类图标">
          <a-input name="icon" placeholder="分类图标" v-decorator="['icon',{initialValue:selectCategory.icon?selectCategory.icon:''}]"></a-input>
        </a-form-item>

        <a-form-item label="分类图片">
          <a-upload :fileList="fileList" list-type="picture" :beforeUpload="checkFile"
                    :action="uploadUrl" :headers="header" @change="afterUpload" :file-list="fileList">
            <a-button v-if="fileList.length<1">
              <a-icon type="upload"/>
              上传
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item
          label="分类级别"
          :required="true"
          
        >
          <a-radio-group v-decorator="['level', { initialValue: selectCategory.level }]" @change="radioChange">
            <a-radio :value="0">一级</a-radio>
            <a-radio :value="1">二级</a-radio>
            <a-radio :value="2">三级</a-radio>
          </a-radio-group>
          <a-form-item :required="this.form.getFieldValue('level') === 1 || this.form.getFieldValue('level') === 2"
                       v-show="this.form.getFieldValue('level') === 1 || this.form.getFieldValue('level') === 2"
                       label="选择父级分类" has-feedback>
            <a-select show-search allowClear
                      v-decorator="['parentId',{ initialValue:selectCategory.parentId}]">
              <a-select-option v-for="item in selectList" :key="item.id">
                {{item.name}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form-item>
        <a-form-item label="排序" :required="true" has-feedback
        >
          <a-input-number :min="0" v-decorator=
            "['sort',{initialValue: selectCategory.sort ?selectCategory.sort:'' ,rules:[{required:true,message:'必须输排序号'}]}]" />
        </a-form-item>
        <a-form-item
          :wrapperCol="{ span: 24 }"
          style="text-align: center"
        >

          <a-button htmlType="submit" type="primary">提交</a-button>
          <a-button style="margin-left: 8px" @click="onClose">取消</a-button>
        </a-form-item>

      </a-form>
    </a-drawer>
    <a-modal :title="modal.title" :visible="modal.visible" @cancel="onCancel" @ok="submitAttrForm" keyboard >
      <a-form>
        <a-form-item label="属性名" :required="true" :labelCol="{lg: {span: 4}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"> 
          <a-auto-complete v-model="attr.attrName"
                           @search="search"
                           :dataSource="matchValue"
                           :defaultOpen="false"
                           defaultValue=""
                          @change="onChange"></a-auto-complete>
        </a-form-item>
        <a-form-item label="排序号" :required="true" 
        :labelCol="{lg: {span: 4}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
        <a-input-number v-model="attr.sort" :min="0" ></a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
  import { getAllAttr, getTree, updateAttr,deleteAttr } from '@/api/category'
  import { deleteCate } from '@/api/category'
  import { getDetail } from '@/api/category'
  import { getCateByLevel } from '@/api/category'
  import { update } from '@/api/category'
  import { add } from '@/api/category'
  import {addAttr} from '@/api/category'
  import notification from 'ant-design-vue/lib/notification'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  export default {
    name: 'Category',
    data () {
      return {
        uploadUrl: process.env.VUE_APP_API_BASE_URL + '/product/category/upload',
        header: {
          Authorization: window.sessionStorage.getItem(ACCESS_TOKEN)
        },
        tree: [],
        loading: false,
        selectCategory: {},
        checkedKeys: {
          checked: []
        },
        fileList: [],
        fields: {
          children: 'children',
          title: 'name',
          key: 'id'
        },
        defaultKeys: [],
        keyWord: '',
        isAdd: false,
        param: {},
        form: this.$form.createForm(this),
        visible: false,
        selectList: [],
        selectRules: { required: true, message: '必须选择父级分类' },
        uploadImg: '',
        uploadToken: '',
        modal : {
          title : '',
          visible : false
        },
        editingKey : '',
        attrList : [],
        attr: {
          attrName : '',
          sort : 0
        },
        matchValue : [],
        isAddAttr : false,
        columns: [
          {
            title: '序号',
            align: 'center',
            customRender: (value, row, index) => {
              return `${index + 1}`
            },
          },
          {
            title: '属性名',
            dataIndex: 'attrName',
            align: 'center',
            scopedSlots: {customRender: "name"}

          },
          {
            title: '排序',
            dataIndex: 'sort',
            align: 'center',
            scopedSlots: {customRender: "sort"}

          },

          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: {customRender: "action"}

          },

        ],

      }
      
    },
    computed: {
      isDisabled: function () {
        return this.checkedKeys.checked.length !== 1
      },
      detailTitle: function () {
        return this.selectCategory.name == undefined ? '' : this.selectCategory.name + '详情'
      },
      editButton: function () {
        return this.selectCategory.name == undefined
      },
      drawerTitle: function () {
        return this.isAdd ? '添加分类' : '编辑分类'
      }
    },

    created () {
      this.getCategory()
    },

    methods: {
      clickAdd () {
        this.isAdd = true
        this.selectCategory = {}
        this.uploadImg = ''
        this.showDrawer()
      },
      editCate () {
        this.isAdd = false
        this.showDrawer()
      },
      select (keys, event) {
        const id = keys[0]
        if (id == undefined) {
          return
        }
        this.getCategoryDetail(keys[0])
      },
      afterUpload ({ file, fileList }) {
        this.fileList = fileList
        if (file.status === 'done') {
          this.uploadImg = file.response.data.url
        }
      },
      checkFile (file) {
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
      submit (e) {
        e.preventDefault()
        this.form.validateFields((err, values) => {
          if (err) {
            return
          }
          values.img = this.uploadImg
          if (this.isAdd) {
            const parentId = this.form.getFieldValue("parentId")
            if (parentId === null) {
              values.parentId = 0
            }
            add(values).then(res => {
              if (res.success) {
                this.onClose()
                this.getCategory()
                this.getCategoryDetail(res.data.data.id)
                notification.success({
                  message: '成功',
                  description: '添加成功'
                })
              } else {
                notification.error({
                  message: '错误',
                  description: res.msg
                })
              }
            })
          } else {
            values.id = this.selectCategory.id
            values.img = this.uploadImg !== '' ? this.uploadImg : this.selectCategory.img
            update(values).then(res => {
              if (res.success) {
                this.onClose()
                this.getCategory()
                this.getCategoryDetail(values.id)
                notification.success({
                  message: '成功',
                  description: '修改成功'
                })
              } else {
                notification.error({
                  message: '错误',
                  description: res.msg
                })
              }
            })
          }
        })
      }
      ,
      clickAddAttr() {
          this.isAddAttr = true
          this.showModal()
      },
      showDrawer () {
        this.visible = true
        if (!this.isAdd) {
          this.getCateByLevel(this.selectCategory.level - 1)
        }
      },
      showModal() {
        if (this.isAddAttr) {
            this.modal.title = "添加属性"
        } else {
            this.modal.title = "编辑属性"
        }
        this.modal.visible = true
        this.getAllAttr()

      },
      onCancel() {
        this.modal.visible = false
        this.attr = {}
      },
      onClose () {
        this.visible = false
        this.selectCategory.parentId = null
        this.fileList = []
        this.form.resetFields()
      },
      editAttr(record) {
        this.isAddAttr = false
        this.attr.id = record.id
        this.attr.attrName = record.attrName
        this.attr.sort = record.sort
        this.attr.categoryId = record.categoryId
        this.showModal()
      },
      edit(key) {
        console.log(key)
      },
      search(text) {
        this.matchValue = []
        for (let i = 0; i < this.attrList.length; i++) {
            if (this.attrList[i].indexOf(text) != -1 && text !== '') {
              this.matchValue.push(this.attrList[i])
            }
        }
      },
      submitAttrForm() {
        if (this.attr.attrName === '' || this.attr.sort === null) {
          notification.error({
              message: '错误',
              description: '属性名必须输入'
            })
        } else if(this.isAddAttr){
          this.attr.categoryId = this.selectCategory.id
          addAttr(this.attr).then(res=>{
            if (res.success) {
              notification.success({
              message: '成功',
              description: '属性添加成功'
            })
            this.getCategoryDetail(this.attr.categoryId)
            this.onCancel() 
            } else {
              notification.error({
              message: '错误',
              description: res.msg
            })
            }
          }) 
                 
        } else {
          updateAttr(this.attr).then(res=>{
            if (res.success) {
              notification.success({
              message: '成功',
              description: '属性修改成功'
            })
            this.getCategoryDetail(this.attr.categoryId)
            this.onCancel() 
            } else {
              notification.error({
              message: '错误',
              description: res.msg
            })
            }
          }) 
        }

      },
      deleteAttr(record) {
        deleteAttr(record).then(res=>{
          if (res.success) {
              notification.success({
              message: '成功',
              description: '删除属性成功'
            })
            this.getCategoryDetail(record.categoryId)
            } else {
              notification.error({
              message: '错误',
              description: res.msg
            })
            }
        })
      },
      onChange(value) {
        this.search(value)
      },
      radioChange (event) {
        this.selectList = []
        this.selectCategory.parentId = null
        this.form.setFieldsValue({
          'parentId': null
        })
        const value = event.target.value - 1
        this.getCateByLevel(value)
      },
    getCategoryDetail (id) {
        getDetail(id).then(res => {
          if (res.success) {
            this.selectCategory = res.data.detail
          } else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
      },
      getCateByLevel (param) {
        if (param < 0) {
          return
        }
        getCateByLevel(param).then(res => {
          if (res.success) {
            this.selectList = res.data.list
          } else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
      },
      getCategory () {
        getTree().then(res => {
          if (res.success) {
            this.tree = res.data.tree
          } else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
      },
      getAllAttr() {
        getAllAttr().then(res=>{
          if (res.success) {
            const list = res.data.list
            this.attrList = list.map(attr=>{
              return attr
            })
          }else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
      },
      deleteCate () {
        this.param = { id: this.checkedKeys.checked[0] }
        deleteCate(this.param).then(res => {
          if (res.success) {
            notification.success({
              message: '成功',
              description: '删除成功'
            })
            this.getCategory()
          } else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
      }

    }
  }

</script>

<style scoped>
  .title {
    color: rgba(0, 0, 0, .85);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
  }

</style>