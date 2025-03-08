// import { Button, Col, DatePicker, Row, Select, Slider } from 'antd';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import React, { useState } from 'react';
// import { ReactComponent as Graphico } from '../../src/Image/graphico.svg';
// import Graph1 from "./Graph1";
// dayjs.extend(customParseFormat);
// const { RangePicker } = DatePicker;
// const dateFormat = 'YYYY/MM/DD';

// function Dashboard() {
//     const [disabled, setDisabled] = useState(false);

//     return (
//         <>
//       <Row className='widgetrow' gutter={24}>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Teacher</p></div>
//             {/* <div className='percent'>
//               +16%
//             </div> */}
//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Student</p></div>
//             <div className='percent'>
//               +16%
//             </div>
//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Course</p></div>
//             <div className='percent'>
//               +16%
//             </div>
//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Money</p></div>
//             <div className='percent'>
//               +16%
//             </div>
//           </div>
//         </Col>
//       </Row>
//       <Row className='graphrow' gutter={24}>
//         <Col xs={24} sm={12} lg={16}>
//           <div className='chartwrap' >
//             <div className='titled'>
//               Overview
//               <div className='daterangewrap'>
//                 <label>Select Date Range:</label>
//                 <RangePicker
//                   defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
//                   format={dateFormat}
//                 />
//                 <Button
//                   type="primary"
//                   size='small'
//                   htmlType="submit"
//                 >
//                   GO
//                 </Button>
//               </div>
//             </div>

//             <Graph1 />

//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={8}>
//           <div className='boxdiv'>
//             <div className='titled'>
//               Sale <Select
//                 defaultValue="Last 365 day"
//                 style={{
//                   width: 120,
//                 }}

//                 options={[
//                   {
//                     value: 'Last 365 day',
//                     label: 'Last 365 day',
//                   },
//                 ]}
//               />
//             </div>
//             <Row gutter={16}>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox invoice'>
//                   <div className='dot'></div>
//                   <h3>$50,000</h3>
//                   <p>50 Invoices</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox paid'>
//                   <div className='dot'></div>
//                   <h3>$2356800</h3>
//                   <p>Paid</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox balance'>
//                   <div className='dot'></div>
//                   <h3>$8796543</h3>
//                   <p>Balance</p>
//                 </div>
//               </Col>
//             </Row>
//           </div>
//           <div className='boxdiv'>
//             <div className='titled'>
//               Purchase <Select
//                 defaultValue="Last 365 day"
//                 style={{
//                   width: 120,
//                 }}

//                 options={[
//                   {
//                     value: 'Last 365 day',
//                     label: 'Last 365 day',
//                   },
//                 ]}
//               />
//             </div>
//             <Row gutter={16}>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox invoice'>
//                   <div className='dot'></div>
//                   <h3>$50,000</h3>
//                   <p>10 Bills</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox paid'>
//                   <div className='dot'></div>
//                   <h3>$2356800</h3>
//                   <p>Paid</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox balance'>
//                   <div className='dot'></div>
//                   <h3>$8796543</h3>
//                   <p>Balance</p>
//                 </div>
//               </Col>
//             </Row>
//           </div>
//           <div className='boxdiv'>
//             <div className='titled'>
//               Profit/Loss <Select
//                 defaultValue="Last 365 day"
//                 style={{
//                   width: 120,
//                 }}

//                 options={[
//                   {
//                     value: 'Last 365 day',
//                     label: 'Last 365 day',
//                   },
//                 ]}
//               />
//             </div>
//             <div className='subtitle'>
//               <h3>$250,000</h3>
//               <p>Gross Profit</p>
//             </div>
//             <Row gutter={16}>
//               <Col xs={24}  >
//                 <div className='inrprofit green mb-4 '>
//                   <div className='dot'></div>
//                   <div>
//                     <h3>$50,000</h3>
//                     <p>10 Bills</p>
//                   </div>
//                   <div className='sliderwrp'><Slider defaultValue={30} disabled={disabled} /></div>
//                 </div>
//               </Col>
//               <Col xs={24}  >
//                 <div className='inrprofit red'>
//                   <div className='dot'></div>
//                   <div>
//                     <h3>$2356800</h3>
//                     <p>Paid</p>
//                   </div>
//                   <div className='sliderwrp'><Slider defaultValue={30} disabled={disabled} /></div>
//                 </div>
//               </Col>

//             </Row>
//           </div>
//         </Col>
//       </Row>
//     </>



//     );
// }

// export default Dashboard;

import { Button, Col, DatePicker, Row, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { ReactComponent as Graphico } from '../../src/Image/graphico.svg';
import Graph1 from "./Graph1";

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    total_teacher: 0,
    total_student: 0,
    total_courses: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          console.error("Authentication tokens are missing. Please log in again.");
          return;
        }
        const accessToken = authData.access_token;

        const response = await axios.get("http://localhost:8000/api/user/dashboared-api/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <Row className='widgetrow' gutter={24}>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'>
              <h3>{dashboardData.total_teacher}</h3>
              <p>Total Teachers</p>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'>
              <h3>{dashboardData.total_student}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'>
              <h3>{dashboardData.total_courses}</h3>
              <p>Total Courses</p>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'>
              <h3>$50,000</h3>
              <p>Today's Money</p>
            </div>
          </div>
        </Col>
      </Row>
      <Row className='graphrow' gutter={24}>
        <Col xs={24} sm={12} lg={16}>
          <div className='chartwrap'>
            <div className='titled'>
              Overview
              <div className='daterangewrap'>
                <label>Select Date Range:</label>
                <RangePicker
                  defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
                  format={dateFormat}
                />
                <Button type="primary" size='small' htmlType="submit">
                  GO
                </Button>
              </div>
            </div>
            <Graph1 />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div className='boxdiv'>
            <div className='titled'>
              Sale <Select
                defaultValue="Last 365 day"
                style={{ width: 120 }}
                options={[{ value: 'Last 365 day', label: 'Last 365 day' }]}
              />
            </div>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div className='inrbox invoice'>
                  <div className='dot'></div>
                  <h3>$50,000</h3>
                  <p>50 Invoices</p>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className='inrbox paid'>
                  <div className='dot'></div>
                  <h3>$2356800</h3>
                  <p>Paid</p>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className='inrbox balance'>
                  <div className='dot'></div>
                  <h3>$8796543</h3>
                  <p>Balance</p>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default Dashboard;
