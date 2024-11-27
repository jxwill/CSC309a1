import CreateBlogPost from "components/createBlogPost";

const CreateBlogpostsPage = ({ token }: { token: string }) => {
    return <CreateBlogPost token={token} />;
};

export const getServerSideProps = async (context: any) => {
    const cookies = context.req.headers.cookie || "";
    const token = cookies.split("token=")[1] || null; // Extract the token from cookies
    return { props: { token } };
};

export default CreateBlogpostsPage;


