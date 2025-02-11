import React from 'react';
import {Layout} from 'antd';
import PropTypes from 'prop-types';
import '../../Styles/Common.scss';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

const {Content} = Layout;
const AdminLayout = props => {
  return (
    <>
      <Layout>
        <Sidebar />
        <Layout>
          <Header />
          <Content className="contentwraper">
            <div className="scrolldiv">{props.children}</div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;