<template>
  <page-header-wrapper>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="角色名称">
              <a-input placeholder="优惠券标题" v-model="queryParam.roleName" />
            </a-form-item>
          </a-col>

          <a-col :md="8" :sm="24">
            <span
              class="table-page-search-submitButtons"
              :style="{ float: 'right', overflow: 'hidden' }"
            >
              <a-button type="primary" icon="plus" @click="add()">添加</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="query()">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => {this.queryParam = {}}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-table
      :dataSource="roles"
      :loading="loading"
      :columns="columns"
      rowKey="id"
      :pagination="pagination"
    >
      <template slot="enabled" slot-scope="text,record">
        <a-switch
          :disabled="record.roleName==='超级管理员'"
          checked-children="启用"
          un-checked-children="停用"
          :checked="text===1"
          @click="change(record)"
        ></a-switch>
      </template>
      <template slot="action" slot-scope="text,record">
        <a @click="edit(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="assignMenu(record)">分配菜单</a>
        <a-divider type="vertical" />
        <a @click="assignResource(record)">分配权限</a>
        <a-divider type="vertical" />
        <a @click="deleteRole(record)">删除</a>
      </template>
    </a-table>
    <a-modal v-model="visible" :title="title" destroyOnClose @ok="submitForm()">
      <a-form :form="form">
        <a-form-item
          label="角色名"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          required
          has-feedback
        >
          <a-input
            v-decorator="['roleName', 
          {rules:[{required: true, message: '请输入角色名'},
          ]
          }]"
          />
        </a-form-item>
        <a-form-item
          label="角色描述"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          required
          has-feedback
        >
          <a-input
            v-decorator="['description', 
          {rules:[{required: true, message: '请输入角色描述'},
          ]
          }]"
          />
        </a-form-item>
        <a-form-item
          label="是否启用"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          required
          v-if="!isEdit"
        >
          <a-radio-group v-decorator="['enabled',{initialValue:1} ]">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model="menuVisible" title="分配菜单" destroyOnClose @ok="submitAssignMenu">
      <a-tree
        checkable
        :defaultExpandAll="true"
        :checkStrictly="false"
        :tree-data="allMenuTree"
        v-model="checkedKeys"
        :replaceFields="fields"
        @check="checked"
      ></a-tree>
    </a-modal>
    <a-drawer :visible="resourceVisible" title="分配权限" destroyOnClose width="950" @close="()=>this.resourceVisible=false">
      <a-transfer
        :list-style="{
      width : '400px',
      height: '500px',
    }"  :titles= "['未分配权限','已分配权限']"
        :dataSource="resources"
        :show-search="true"
        :showSelectAll="true"
        :rowKey="record=>record.key"
        :target-keys="targetKeys"
        @change="handleChange"
        :render="item => `${item.title}-${item.description}=>url:${item.url}`"
      ></a-transfer>
       <div style="text-align:center;margin-top:10px">
        <a-button type='primary' style="margin-right:20px" @click="submitResource">提交</a-button>
        <a-button type="danger" @click="()=>this.resourceVisible=false">取消</a-button>
    </div>
    </a-drawer>
   
  </page-header-wrapper>
</template>

<script>
import {
  getRoles,
  changeStatus,
  addRole,
  editRole,
  allMenu,
  getRoleMenu,
  assignMenu,
  allResource,
  getResource,
  assignResource,
  deleteRole,
} from '@/api/role'
import { notification } from 'ant-design-vue'
import { isContained } from '@/utils/util'
export default {
  name: 'Role',
  data() {
    return {
      queryParam: {},
      roles: [],
      loading: false,
      visible: false,
      isEdit: false,
      selectRoleId: 0,
      allMenuTree: [],
      menuVisible: false,
      resourceVisible: false,
      currentRoleMenu: [],
      resources: [],
      targetKeys: [],
      keys: [],
      checkedKeys: [],
      form: this.$form.createForm(this),
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
      },

      columns: [
        {
          title: 'ID',
          dataIndex: 'id',
          align: 'center',
        },
        {
          title: '角色名',
          dataIndex: 'roleName',
          align: 'center',
        },
        {
          title: '角色描述',
          dataIndex: 'description',
          align: 'center',
        },
        {
          title: '用户数量',
          dataIndex: 'count',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'enabled',
          align: 'center',
          scopedSlots: { customRender: 'enabled' },
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
      fields: { children: 'children', title: 'title', key: 'id' },
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
  computed: {
    title() {
      return this.isEdit ? '编辑角色' : '新增角色'
    },
  },
  mounted() {
    this.queryData(this.queryParam)
  },
  methods: {
    query() {
      this.queryData(this.queryParam)
    },
    change(record) {
      const that = this
      this.$confirm({
        title: '确定是否变更状态？',
        onOk() {
          changeStatus({ id: record.id, enabled: 1 - record.enabled }).then((res) => {
            if (res.success) {
              that.roles.forEach((role) => {
                if (role.id === record.id) {
                  role.enabled = 1 - record.enabled
                }
              })
            } else {
              notification.error({
                message: '错误',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    queryData(param) {
      this.loading = true
      getRoles(param).then((res) => {
        if (res.success) {
          this.roles = res.data.page.list
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
    add() {
      this.visible = true
      this.isEdit = false
    },
    edit(record) {
      this.visible = true
      this.isEdit = true
      this.selectRoleId = record.id
      this.$nextTick(() => {
        this.form.setFieldsValue({
          roleName: record.roleName,
          description: record.description,
          enabled: record.enabled,
        })
      })
    },
    checked(checkedKeys, e) {
      if (!checkedKeys && !halfCheckedKeys) {
        return
      }
      if (e.halfCheckedKeys) {
        this.keys = checkedKeys.concat(e.halfCheckedKeys)
      } else {
        this.keys = checkedKeys
      }
    },
    submitForm() {
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        if (!this.isEdit) {
          addRole(values).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '新增角色成功',
              })
              this.visible = false
              this.queryData(this.queryParam)
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        } else {
          values.id = this.selectRoleId
          editRole(values).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '修改角色成功',
              })
              this.visible = false
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
    assignMenu(record) {
      this.selectRoleId = record.id
      getRoleMenu(record.id).then((res) => {
        if (res.success) {
          this.currentRoleMenu = res.data.list
          let ids = this.currentRoleMenu.map((m) => {
            return m.id
          })
          this.checkedKeys = {
            checked: [],
            halfChecked: [],
          }
          allMenu().then((res) => {
            if (res.success) {
              this.allMenuTree = res.data.list
              let list = []
              this.getMenuList(this.allMenuTree, list)
              list.forEach((item) => {
                if (item.level == 0) {
                  let childrenIds = item.children.map((i) => {
                    return i.id
                  })
                  if (isContained(ids, childrenIds)) {
                    this.checkedKeys.checked.push(item.id)
                  } else {
                    let idsSet = new Set(ids)
                    let childrenSet = new Set(childrenIds)
                    let arr = Array.from(new Set(ids.filter((s) => childrenSet.has(s))))
                    if (arr.length != 0) {
                      this.checkedKeys.halfChecked.push(item.id)
                    }
                  }
                }
              })
              this.currentRoleMenu.forEach((menu) => {
                if (menu.level != 0) {
                  this.checkedKeys.checked.push(menu.id)
                }
              })
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
      this.menuVisible = true
    },
    assignResource(record) {
      this.selectRoleId = record.id
      this.targetKeys = []
      allResource().then((res) => {
        if (res.success) {
          let transferData = []
          res.data.list.forEach((item) => {
            transferData.push({
              key: item.id.toString(),
              id: item.id.toString(),
              title: item.name,
              url: item.url,
              description: item.detail,
              chosen: false,
            })
          })
          getResource(record.id).then((res) => {
            if (res.success) {
              let data = res.data.list
              data.forEach(item=>{
                  this.targetKeys.push(item.id.toString())
              })
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
          this.resources = transferData
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
      this.resourceVisible = true
    },
    handleChange(targetKeys, direction, moveKeys) {
      this.targetKeys = targetKeys
    },
    submitAssignMenu() {
      const id = this.selectRoleId

      if (this.keys.length == 0 && this.checkedKeys.checked) {
        this.keys = this.checkedKeys.checked.concat(this.checkedKeys.halfChecked)
      }
      assignMenu(id, this.keys).then((res) => {
        if (res.success) {
          this.menuVisible = false
          this.keys = []
          notification.success({
            message: '成功',
            description: '分配完成',
          })
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    submitResource() {
        const ids = this.targetKeys.map(item=>{
            return parseInt(item)
        })
        assignResource(this.selectRoleId,ids).then(res=>{
            if (res.success) {
                notification.success({
                    message : "成功",
                    description : "分配权限成功"
                })
                this.resourceVisible = false
            } else {
                notification.error({
                    message : '失败',
                    description : res.msg
                })
            }
        })
    },
    deleteRole(record) {
        const that = this
        this.$confirm({
            title : "确认是否删除该角色",
            onOk() {
                deleteRole(record.id).then(res=>{
                    if (res.success) {
                        notification.success({
                            message : "成功",
                            description : "删除角色成功"
                        }) 
                        that.query()
                    } else {
                        notification.error({
                            message : "失败",
                            description : res.msg
                        })
                    }
                })
            }
        })
    },
    getMenuList(tree, arr) {
      if (tree) {
        tree.forEach((item) => {
          arr.push(item)
          this.getMenuList(item.children, arr)
        })
      }
    },
  },
}
</script>

<style scoped>
</style>