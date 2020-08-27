<template>
  <page-header-wrapper>
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="手机号码">
                    <a-input v-model="queryParam.mobile" placeholder="手机号"/>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="昵称">
                    <a-input v-model="queryParam.nickname" placeholder="昵称"/>
                  </a-form-item>
                </a-col>
                <template v-if="advanced">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="等级">
                      <a-select v-model="queryParam.rank" placeholder="请选择" allowClear>
                        <a-select-option value="普通用户">普通用户</a-select-option>
                        <a-select-option value="黄金会员">黄金会员</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="注册日期">
                      <a-date-picker v-model="queryParam.registerDate" @change="selectDate" style="width: 100%" placeholder="请输入注册日期"/>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="状态">
                      <a-select v-model="queryParam.status" placeholder="请选择" allowClear>
                        <a-select-option value="1">正常</a-select-option>
                        <a-select-option value="0">禁用</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="性别">
                      <a-select placeholder="请选择" v-model="queryParam.gender" allowClear>
                        <a-select-option value="男">男</a-select-option>
                        <a-select-option value="女">女</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons"
                    :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="queryData">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a>
              </span>
                </a-col>
              </a-row>
            </a-form>
          </div>

          <a-table bordered :data-source="list" :loading="loading" :columns="columns" rowKey="{record=>record.id}" :pagination="pagination">
              <template slot-scope="text,record" slot="status">
                <div>
                  <a-switch :checked="text == '1'" @change="changeStatus(record)"></a-switch>
                </div>
              </template>
              <template slot-scope="text,record" slot="rank">
                <a-tag v-if="text === '普通用户'" color="#2db7f5">普通用户</a-tag>
                <a-tag v-else-if="text === '黄金会员'" color="#CD7F32">黄金会员</a-tag>
              </template>
          </a-table>
        </a-card>
  </page-header-wrapper>
</template>

<script>
  import {getList,changeStatus} from '@/api/member'
  import notification from 'ant-design-vue/lib/notification'

  export default {
    name: 'MemberList',
    created () {
      this.getData()
    },
    data () {
      return {

        advanced: false,
        queryParam: {
          page : '',
          size : '',
          mobile: '',
          nickname: '',
          // rank : null,
          // status: null,
          registerDate: null,
          // gender: null
        },
        list : [],
        loading : this.$store.state.loading,
        columns : [
          {
            title : "序号",
            align : "center",
            width : '80px',
            customRender:(value,row,index) => {
              return `${(this.pagination.defaultCurrent-1)*this.pagination.defaultPageSize+index+1}`
            }
          },
          {
            title : "手机号",
            align : "center",
            dataIndex : "mobile",
          },
          {
            title : "昵称",
            align : "center",
            dataIndex : "nickname",
          },
          {
            title : "性别",
            align : "center",
            dataIndex : "gender",
          },
          {
            title : "注册时间",
            align : "center",
            dataIndex : "registerDate",
          },
          {
            title : "用户等级",
            align : "center",
            dataIndex : "rank",
            scopedSlots: {customRender: "rank"}
          },
          {
            title : "用户状态",
            align : "center",
            dataIndex : "status",
            scopedSlots : {customRender:'status'}
          }
        ],
        pagination : {
          defaultCurrent : 1,
          defaultPageSize : 10,
          total : 0,
          showSizeChanger:true,
          pageSizeOptions :['10','20','30'],
          showTotal:(total)=>`共${total}条记录`,
          onShowSizeChange : (current,pageSize)=>{
            this.pagination.defaultCurrent=1
            this.pagination.defaultPageSize=pageSize
            this.queryParam.page = this.pagination.defaultCurrent
            this.queryParam.size = this.pagination.defaultPageSize
            this.getData(this.queryParam)
          },
          onChange:(current,size)=>{
            this.pagination.defaultCurrent = current
            this.pagination.defaultPageSize = size
            this.queryParam.page = this.pagination.defaultCurrent
            this.queryParam.size = this.pagination.defaultPageSize
            this.getData(this.queryParam)
          }
        }


      }
    },
    methods: {
      getData(params) {
        this.loading = true
        getList(params).then(res=>{
          if (res.success) {
            const data = res.data.page
            this.list = data.list
          } else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
        this.loading = false
      },
      toggleAdvanced () {
        this.advanced = !this.advanced
      },
      queryData() {
        this.getData(this.queryParam)
      },
      selectDate(date,dateString) {
        console.log(dateString)
        this.queryParam.registerDate = date !== null ? dateString : null
      },
      changeStatus(record) {
        changeStatus({
          id : record.id,
          status : (1 - record.status)
        }).then(res=>{
          if (res.success) {
            // this.getData(this.queryParam)
            notification.success({
              message: '成功',
              description: "修改用户状态成功！"
            })
            record.status = 1 - record.status
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      }
  }
</script>

<style scoped lang="less">
</style>