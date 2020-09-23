<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="商品编号">
                <a-input placeholder="商品编号" v-model="queryParam.goodsSn" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="用户手机">
                <a-input placeholder="用户手机" v-model="queryParam.userMobile" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="评分">
                <a-select option-label-prop="label" v-model="queryParam.score" allowClear>
                  <a-select-option
                    :value="item"
                    :label="item+'星'"
                    v-for="(item,index) in 5"
                    :key="index"
                  >
                    <span aria-label="item+'星'">
                      <a-rate :value="item" />
                    </span>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24" :offset="16">
              <span
                class="table-page-search-submitButtons"
                :style="{ float: 'right', overflow: 'hidden' }"
              >
                <a-button type="primary" @click="queryList">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <a-table
        borderd
        :dataSource="commentList"
        :loading="loading"
        :columns="columns"
        rowKey="{record=>record.id}"
        :pagination="pagination"
      >
        <template slot="score" slot-scope="text,record">
          <a-rate :default-value="text" disabled></a-rate>
        </template>
        <template slot="likes" slot-scope="text,record">
          <a-badge :count="text">
              <a-icon type="like" style="fontSize:25px" theme='twoTone'/>
          </a-badge>
        </template>
        <template slot="specAndValue" slot-scope="text,record">
          <span style="fontSize:10px">{{text}}</span>
        </template>
        <template slot="action" slot-scope="text,record">
          <a type="link" @click="openDetail(record)">详情</a>
        </template>
      </a-table>
    </a-card>
    <a-modal v-model="disabled" title="评论详情">
      <a-comment>
        <span key="comment-basic-like">
          <a-tooltip title="点赞">
            <a-icon type="like" theme="twoTone"></a-icon>
          </a-tooltip>
          <span style="cursor:auto">{{selectRecord.likes}}</span>
        </span>
        <a slot="author">{{selectRecord.nickName}}</a>
        <a-avatar slot="avatar" :src="selectRecord.avatar" />
            <a-tooltip slot="datetime" >
              <span>{{ selectRecord.createTime}}</span>
            </a-tooltip>
        
        <p slot="content">{{selectRecord.content}}</p>
        <div slot='content' v-if='selectRecord.imgs'>
            <a-row type="flex" >
                <a-col :span="5" v-for="(item,index) in selectRecord.imgs" :key='index'>
                    <img :src='item' style="width:80px ; height:80px" preview="0"/>
                </a-col>
            </a-row>
        </div>
        <template v-if="selectRecord.replies">
          <a-comment v-for="(item,index) in selectRecord.replies" :key="index">
            <a slot="author">{{item.nickName}}</a>
            <a-avatar slot="avatar" :src="item.avatar" />
            <a-tooltip slot="datetime" :title="item.createTime.format('YYYY-MM-DD HH:mm:ss')">
              <span>{{ item.createTime.fromNow()}}</span>
            </a-tooltip>
            <p slot="content">{{item.content}}</p>
            <template v-if="item.replies">
              <a-comment v-for="(item1,index) in item.replies" :key="index">
                <a slot="author">{{item1.nickName}}</a>
                <a-avatar slot="avatar" :src="item1.avatar" />
                <a-tooltip slot="datetime" :title="item1.createTime.format('YYYY-MM-DD HH:mm:ss')">
              <span>{{ item1.createTime.fromNow()}}</span>
            </a-tooltip>
                <p slot="content">{{item1.content}}</p>
              </a-comment>
            </template>
          </a-comment>
        </template>
      </a-comment>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import { commentList, commentDetail } from '@/api/comment'
import { notification } from 'ant-design-vue'
import moment from 'moment'

export default {
  name: 'Comment',
  data() {
    return {
      queryParam: {},
      moment,
      commentList: [],
      selectRecord: {},
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
          title: '商品编号',
          dataIndex: 'goodsSn',
          align: 'center',
        },
        {
          title: '商品名',
          dataIndex: 'goodsTitle',
          align: 'center',
        },
        {
          title: '用户手机',
          dataIndex: 'userMobile',
          align: 'center',
        },
        {
          title: '商品规格',
          dataIndex: 'specAndValue',
          align: 'center',
          width: '160px',
          scopedSlots: { customRender: 'specAndValue' },
        },

        {
          title: '评分',
          dataIndex: 'score',
          align: 'center',
          width: '180px',
          scopedSlots: { customRender: 'score' },
        },

        {
          title: '评论时间',
          dataIndex: 'createTime',
          align: 'center',
        },
        {
          title: '操作',
          dataIndex: 'aciton',
          scopedSlots: { customRender: 'action' },
        },
      ],
      disabled: false,
      loading: false,
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
  methods: {
    queryList() {
        this.queryData(this.queryParam)
    },
    queryData(param) {
      this.loading = true
      commentList(param).then((res) => {
        if (res.success) {
          this.commentList = res.data.list.list.filter((item) => item != null)
          this.commentList.forEach((item) => {
            let specAndValue = item.specAndValue
            let str = ''
            for (var i in specAndValue) {
              str = str.concat(i, ':', specAndValue[i], ';')
            }
            item.specAndValue = str.substring(0, str.length - 1)
          })
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
        this.loading = false
      })
    },
    openDetail(record) {
      this.disabled = true
      commentDetail(record.id).then((res) => {
        if (res.success) {
          let data  = res.data.detail
          data.dateTime = moment(data.createTime)
          this.onversionTime(data.replies)
          this.selectRecord = data
          this.$forceUpdate()
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },

    onversionTime(arr) {
      if (arr) {
        arr.forEach((item) => {
          item.createTime = moment(item.createTime)
          this.onversionTime(item.replies)
        })
      }
    },
  },
}
</script>

<style scoped>
</style>