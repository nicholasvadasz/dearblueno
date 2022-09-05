import styles from "./ReportReview.module.scss";
import { IReport } from "types/IReport";
import { deleteComment, resolveReport } from "gateways/PostGateway";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";

interface ReportReviewProps {
  report: IReport;
}

export default function ReportReview(props: ReportReviewProps) {
  const queryClient = useQueryClient();

  const reportAction = async (action: boolean) => {
    if (!action) {
      await deleteComment(
        props.report.post.postNumber,
        props.report.comment.commentNumber
      );
    }
    const response = await resolveReport(
      props.report.post.postNumber,
      props.report.comment.commentNumber
    );
    if (response.success) {
      queryClient.setQueryData(
        ["moderatorreports"],
        (data: InfiniteData<IReport[]> | undefined) => {
          const newData = data
            ? (JSON.parse(JSON.stringify(data)) as InfiniteData<IReport[]>)
            : undefined;
          newData?.pages.forEach(
            (_, index, array) =>
              (array[index] = array[index].filter(
                (report) =>
                  report.post.postNumber !== props.report.post.postNumber ||
                  report.comment.commentNumber !==
                    props.report.comment.commentNumber
              ))
          );
          return newData;
        }
      );
    } else {
      toast.error((response.message as unknown as { message: string }).message);
    }
  };

  return (
    <div className={styles.ReportReview}>
      <Link href={`/post/${props.report.post.postNumber}`}>
        <strong className={styles.ReportReviewHeader}>
          id: {props.report._id} on Post {props.report.post.postNumber}
        </strong>
      </Link>
      <p>{props.report.comment.content}</p>
      <strong style={{ color: "red" }}>Reason: {props.report.reason}</strong>
      <div className={styles.ButtonContainer}>
        <div
          className={styles.Button}
          style={{ backgroundColor: "red" }}
          onClick={() => void reportAction(false)}
        >
          Delete Comment
        </div>
        <div
          className={styles.Button}
          style={{ backgroundColor: "green" }}
          onClick={() => void reportAction(true)}
        >
          Clear Report
        </div>
      </div>
    </div>
  );
}
