const Mock = require('mockjs');

// 2、获取 mock.Random 对象
// const random = Mock.Random;
// console.log(random); // 简单使用就不操作了，需要操作的可以去看文档
import asyncdata from './data'
import tableData from './tableData'


// 3、基本用法 Mock.mock(url, type, data) // 参数文档 https://github.com/nuysoft/Mock/wiki
Mock.mock('/user/list', 'get', {
  code: 200,
  message: '成功',
  data:asyncdata
});

Mock.mock('/user/tableData', 'get', {
  code: 200,
  message: '成功',
  data:tableData
});