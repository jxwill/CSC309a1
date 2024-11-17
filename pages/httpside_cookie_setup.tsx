import cookie from "cookie";
import { GetServerSideProps } from "next";

interface example {
    token: string | null;
  }


export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context;
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token || null;
  
    if (!token) {
      return {
        redirect: {
          destination: "/logout",
          permanent: false,
        },
      };
    }
  
    return { props: { token } };
  };

  export default function ProfilePage({token }: example) {
    //就是getServerSideProps这个是拿token的然后在你要写的方程里面写传递下来的
    //参数，就比如这个token

  }