<template>
  <page-header-wrapper>
    <a-card border="false">
      <div class="table-page-search-wrapper">
        <a-form layout='inline'>
          <a-row :gutter='48'>
            <a-col :md="8" :sm="24">
              <a-form-item label="会员手机">
                <a-input placeholder="会员手机" v-model="queryParam.mobile"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收货人名称">
                <a-input placeholder="收货人名称" v-model="queryParam.receiver"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收货人手机号">
                <a-input placeholder="收货人手机号" v-model="queryParam.receiverMobile"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24" :offset="16">
              <span class="table-page-search-submitButtons" :style="{ float: 'right', overflow: 'hidden' }">
                <a-button type="primary" @click="queryData">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

            <a-table bordered :data-source="list" :loading="loading" :columns="columns" rowKey="{record=>record.id}" :pagination="pagination">

            </a-table>
    </a-card>

  </page-header-wrapper>

</template>

<script>
  import { getAddrList } from '@/api/member'
  import notification from 'ant-design-vue/lib/notification'

  export default {
    name: 'Address',
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
            title : '会员手机号',
            dataIndex : 'mobile',
            align : "center"
          },
          {
            title : '会员昵称',
            dataIndex : 'memNickname',
            align : "center"
          },
          {
            title : '收货人',
            dataIndex : 'receiver',
            align : "center"

          },
          {
            title : '收货人手机号',
            dataIndex : 'receiverMobile',
            align : "center",
          },
          {
            title : '收货区域',
            dataIndex : 'area',
            align: "center"
          },
          {
            title : '详细地址',
            dataIndex : 'address',
            align : "center",

          }
        ],

        list: [],
        loading : false,
        queryParam: {},
        page: '',
        size: '',
        pagination: {
          defaultCurrent: 1,
          defaultPageSize: 10,
          total: 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total) => `共${total}条记录`,
          onShowSizeChange: (current, pageSize) => {
            this.loading = true
            this.pagination.defaultCurrent = 1
            this.pagination.defaultPageSize = pageSize
            this.queryParam.page = this.pagination.defaultCurrent
            this.queryParam.size = this.pagination.defaultPageSize
            this.getData(this.queryParam)
            this.loading = false
          },
          onChange: (current, size) => {
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
    methods: {
      queryData() {
        this.getData(this.queryParam)
      },
      getData(param) {
        this.loading = true
        getAddrList(param).then(res=>{
          console.log(res)
          if (res.success) {
            const data = res.data.page
            this.list = data.list
            this.pagination.defaultCurrent= data.currPage
            this.pagination.defaultPageSize = data.pageSize
            this.pagination.total = data.totalCount
          } else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
        this.loading = false

      },

    }

  }
</script>

<style scoped>

</style>