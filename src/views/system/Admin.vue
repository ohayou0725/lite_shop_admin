<template>
  <page-header-wrapper>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="用户名">
              <a-input placeholder="用户名" v-model="queryParam.username" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" v-model="queryParam.status" allowClear>
                <a-select-option value="0">正常</a-select-option>
                <a-select-option value="1">已停用</a-select-option>
                <a-select-option value="2">已锁定</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="26">
            <a-form-item label="创建日期">
              <a-date-picker v-model="queryParam.createTime" allowClear></a-date-picker>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24" :offset="16">
            <span
              class="table-page-search-submitButtons"
              :style="{ float: 'right', overflow: 'hidden' }"
            >
              <a-button type="primary" icon="plus" @click="addUser">添加</a-button>
              <a-button type="primary" @click="query()" style="margin-left: 8px">查询</a-button>
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
      <template slot="avatar" slot-scope="text,record">
        <img :src="text" style="width:40px;height:40px" />
      </template>
      <template slot="role" slot-scope="text,record">
        <a-tag color="blue" v-for="(item,index) in record.role" :key="index">{{item.roleName}}</a-tag>
      </template>
      <template slot="status" slot-scope="text,record">
        <a-badge v-if="text==0" color="green" text="正常"></a-badge>
        <a-badge v-if="text==1" color="red" text="已停用"></a-badge>
        <a-badge v-if="text==2" color="yellow" text="已锁定"></a-badge>
      </template>
      <template slot="action" slot-scope="text,record">
        <div v-if="record.username != currentUser">
          <a @click="resetPwd(record.id)">重置密码</a>
          <a-divider type="vertical" />
          <a @click="edit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="deleteUser(record)">删除</a>
        </div>
      </template>
    </a-table>
    <a-modal
      v-model="visible"
      :title="title"
      @ok="submitForm()"
      destroyOnClose
      :afterClose="closeModal"
    >
      <a-form :form="form">
        <a-form-item
          label="用户名"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          required
          has-feedback
        >
          <a-input
            v-decorator="['username', 
          {rules:[{required: true, message: '请输入用户名'},
          ]
          }]"
          />
        </a-form-item>

        <a-form-item label="用户头像" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            :fileList="fileList"
            list-type="picture-card"
            :beforeUpload="checkFile"
            :action="uploadUrl"
            :headers="header"
            @change="afterUpload"
            v-decorator="['avatar', 
            {rules : [{validator : handleUploadAvatar}]}]"
          >
            <div v-if="fileList < 1">
              <a-icon :type="loading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="角色" :labelCol="labelCol" :wrapperCol="wrapperCol" required has-feedback>
          <a-select
            mode="multiple"
            style="width:100%"
            placeholder="分配角色"
            v-decorator="['roles', 
          {rules:[{required: true, message: '请至少分配一个角色'},
          ]
          }]"
          >
            <a-select-option
              v-for="(item,index) in roleList"
              :key="index"
              :value="item.id"
            >{{item.roleName}}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="isEdit" label="用户状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['status']">
            <a-radio :value="0">正常</a-radio>
            <a-radio :value="1">停用</a-radio>
            <a-radio :value="2">锁定</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import { userList, resetPassword, addUser, updateUser, deleteUser } from '@/api/admin'
import { notification } from 'ant-design-vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import store from '@/store'
import { roleList } from '@/api/role'
export default {
  name: 'Admin',
  data() {
    return {
      uploadUrl: process.env.VUE_APP_API_BASE_URL + '/system/user/upload',
      header: {
        Authorization: window.sessionStorage.getItem(ACCESS_TOKEN),
      },
      queryParam: {},
      form: this.$form.createForm(this),
      list: [],
      roleList: [],
      loading: false,
      visible: false,
      isEdit: false,
      currentUserId: null,
      fileList: [],
      currentUser: store.getters.nickname,
      columns: [
        // {
        //   title: '序号',
        //   align: 'center',
        //   width: '40px',
        //   customRender: (value, row, index) => {
        //     return `${(this.pagination.defaultCurrent - 1) * this.pagination.defaultPageSize + index + 1}`
        //   },
        // },
        {
          title: 'ID',
          dataIndex: 'id',
          align: 'center',
        },
        {
          title: '用户名',
          dataIndex: 'username',
          align: 'center',
        },
        {
          title: '头像',
          dataIndex: 'avatar',
          align: 'center',
          scopedSlots: { customRender: 'avatar' },
        },
        {
          title: '角色',
          dataIndex: 'role',
          align: 'center',
          scopedSlots: { customRender: 'role' },
        },
        {
          title: '状态',
          dataIndex: 'status',
          align: 'center',
          scopedSlots: { customRender: 'status' },
        },

        {
          title: '创建时间',
          dataIndex: 'createTime',
          align: 'center',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
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
  mounted() {
    this.queryData(this.queryParam)
  },
  computed: {
    title() {
      return this.isEdit ? '编辑用户' : '新增用户'
    },
  },
  methods: {
    onChange(date, dateString) {},
    query() {
      this.queryData(this.queryParam)
    },
    queryData(param) {
      this.loading = true
      if (param.createTime) {
        param.createTime = param.createTime.format('YYYY-MM-DD HH:mm:ss')
      }
      userList(param).then((res) => {
        if (res.success) {
          this.list = res.data.page.list
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
        this.loading = false
      })
    },
    addUser() {
      this.isEdit = false
      this.visible = true
      this.getAllRole()
    },
    getAllRole() {
      roleList().then((res) => {
        if (res.success) {
          this.roleList = res.data.list
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    deleteUser(record) {
      const that = this
      this.$confirm({
        title: '确定是否删除该用户？删除后将无法恢复!',
        onOk() {
          deleteUser(record.id).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '删除用户成功',
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
    edit(record) {
      this.isEdit = true
      this.currentUserId = record.id
      this.visible = true
      this.getAllRole()
      this.$nextTick(() => {
        this.form.setFieldsValue({
          username: record.username,
          status: record.status,
        })
        let roles = []
        record.role.forEach((r) => {
          roles.push(r.id)
        })
        this.form.setFieldsValue({
          roles: roles,
        })
        this.fileList = [
          {
            uid: '-1',
            status: 'done',
            name: 'avatar',
            url: record.avatar,
          },
        ]
      })
    },
    submitForm() {
      this.form.validateFields((err, values) => {
        if (!err) {
          let param = {}
          param.username = values.username
          if (values.avatar) {
            param.avatar = values.avatar.file.response.data.url
          }
          param.role = []
          values.roles.forEach((role) => {
            param.role.push({ id: role })
          })
          if (this.isEdit) {
            param.status = values.status
            param.id = this.currentUserId
            updateUser(param).then((res) => {
              if (res.success) {
                this.queryData(this.queryParam)
                this.visible = false
                notification.success({
                  message: '成功',
                  description: '修改用户成功',
                })
              } else {
                notification.error({
                  message: '失败',
                  description: res.msg,
                })
              }
            })
          } else {
            addUser(param).then((res) => {
              this.queryData(this.queryParam)
              this.visible = false
              if (res.success) {
                notification.success({
                  message: '成功',
                  description: '添加用户成功',
                })
              } else {
                notification.error({
                  message: '失败',
                  description: res.msg,
                })
              }
            })
          }
        }
      })
    },
    resetPwd(id) {
      const that = this
      this.$confirm({
        title: '确定要重置该用户密码？',
        onOk() {
          resetPassword(id).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '重置密码成功',
              })
            } else {
              notification.success({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    closeModal() {
      this.fileList = []
    },
    handleUploadAvatar(rule, value, callback) {
      if (this.fileList.length < 1) {
        callback('必须上传一张图片')
      }
      callback()
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