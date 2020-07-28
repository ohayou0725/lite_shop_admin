<template>
  <page-header-wrapper>
    <a-card border="false">
      <div class="table-page-search-wrapper">
        <a-form layout='inline'>
          <a-row :gutter='48'>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作管理员">
                <a-input placeholder="操作管理员" v-model="queryParam.admin"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作状态">
                <a-select placeholder="请选择" default-value="1" v-model="queryParam.status">
                  <a-select-option value="0">失败</a-select-option>
                  <a-select-option value="1">成功</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作日期">
                <a-date-picker @change="selectDate" style="width: 100%" :default-value="queryParam.operatingTime" placeholder="请输入操作日期" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24" :offset="16">
              <span class="table-page-search-submitButtons" :style="{ float: 'right', overflow: 'hidden' }">
                <a-button type="primary" @click="queryByParam">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <a-table :data-source="list" :loading="loading" :columns="columns" rowKey="{record=>record.id}" :pagination="pagination">
        <template slot-scope="text,record" slot="optStatus">
            <a-tag v-if="text===statusMap.success.status" color="#87d068">{{statusMap.success.text}}</a-tag>
            <a-tag v-else color="#f50">{{statusMap.success.text}}</a-tag>
        </template>
      </a-table>
    </a-card>

  </page-header-wrapper>
</template>

<script>
  import { list } from '@/api/adminLog'
  import notification from 'ant-design-vue/lib/notification'
  import moment from 'moment'
  const statusMap = {
    success : {
      status : 1,
      text: '成功'
    },
    failed : {
      status: 0,
      text: '失败'
    }

  }
  export default {
    name: 'Log',
    data () {
      return {
        columns : [
          {
            title: '序号',
            align: 'center',
            customRender:(value,row,index) => {
              return `${(this.pagination.defaultCurrent-1)*this.pagination.defaultPageSize+index+1}`
            }
          },
          {
            title : '操作管理员',
            dataIndex : 'admin',
            key : 'admin',
            align : "center"
          },
          {
            title : 'IP地址',
            dataIndex : 'ip',
            key : 'ip',
            align : "center"

          },
          {
            title : '操作时间',
            dataIndex : 'createTime',
            key : 'time',
            align : "center",
          },
          {
            title : '操作动作',
            dataIndex : 'action',
            key : 'action'
          },
          {
            title : '操作状态',
            dataIndex : 'status',
            key : 'status',
            align : "center",
            scopedSlots: {customRender: 'optStatus'}

          },
          {
            title : '操作结果',
            dataIndex : 'result',
            key : 'result',
            align : "center"

          },
          {
            title : '备注信息',
            dataIndex : 'comment',
            key : 'comment',
            align : "center"

          }
        ],
        statusMap : statusMap,
        list: [],
        loading: false,
        queryParam: {
          admin: '',
          status: '',
          operatingTime: moment(new Date(),"YYYY-mm-dd"),
          page : 1,
          size : 10
        },
        pagination : {
          defaultCurrent : 1,
          defaultPageSize : 10,
          total : 0,
          showSizeChanger:true,
          pageSizeOptions :['10','20','30'],
          showTotal:(total)=>`共${total}条记录`,
          onShowSizeChange : (current,pageSize)=>{
            this.loading = true
            this.pagination.defaultCurrent=1
            this.pagination.defaultPageSize=pageSize
            this.queryParam.page = this.pagination.defaultCurrent
            this.queryParam.size = this.pagination.defaultPageSize
            this.getData(this.queryParam)
            this.loading = false
          },
          onChange:(current,size)=>{
            this.loading = true
            this.pagination.defaultCurrent = current
            this.pagination.defaultPageSize = size
            this.queryParam.page = this.pagination.defaultCurrent
            this.queryParam.size = this.pagination.defaultPageSize
            this.getData(this.queryParam)
            this.loading = false
          }
        }

      }
    },
    created () {
      this.getData(this.queryParam)
    },

    methods : {
      moment,
      getData(param) {
        list(param).then(res=>{
          if (res.success) {
            const data = res.data.page
            this.list = data.list
            this.pagination.defaultCurrent= data.currPage
            this.pagination.defaultPageSize = data.pageSize
            this.pagination.total = data.totalCount
          } else {
            notification.error({
              message: '错误',
              description: res.data.msg
            })
          }
        })
      },
      queryByParam() {
        this.loading = true
        this.queryParam.date=1
        this.queryParam.size=10
        this.getData(this.queryParam)
        this.loading = false
      },
      selectDate(date,dateString) {
        this.queryParam.operatingTime = dateString
        console.log(this.queryParam.operatingTime)
      }
    }
  }
</script>

<style scoped lang="less">
</style>