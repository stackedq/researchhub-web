import { css, StyleSheet } from "aphrodite";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { useDispatch } from "react-redux";
import { Value } from "slate";
import Plain from "slate-plain-serializer";

import DiscussionCard from "~/components/DiscussionCard";
import DiscussionPostMetadata from "~/components/DiscussionPostMetadata";
import TextEditor from "~/components/TextEditor";
import VoteWidget from "~/components/VoteWidget";

import DiscussionActions from "~/redux/discussion";

import colors, { discussionPageColors } from "~/config/themes/colors";
import icons from "~/config/themes/icons";
import { isEmpty } from "~/config/utils";

const DiscussionThreadPage = (props) => {
  const { discussion } = props;

  let title = "";
  let body = "";
  let comments = [];
  let username = "";
  let createdDate = "";

  if (discussion.success) {
    title = discussion.title;
    body = discussion.text;
    comments = discussion.commentPage.comments;
    createdDate = discussion.createdDate;
    username = createUsername(discussion);
  }

  function renderComments(comments) {
    return comments.map((c, i) => {
      let divider = <div className={css(styles.divider)} />;
      if (i === 0) {
        divider = null;
      }
      return (
        <Fragment key={c.id}>
          {divider}
          <Comment key={c.id} data={c} />
        </Fragment>
      );
    });
  }

  return (
    <div>
      <div className={css(styles.threadContainer)}>
        <Thread
          title={title}
          body={body}
          username={username}
          date={createdDate}
        />
      </div>
      <div className={css(styles.divider)} />
      <div className={css(styles.contentContainer)}>
        <CommentBox />
        {renderComments(comments)}
      </div>
    </div>
  );
};

DiscussionThreadPage.getInitialProps = async ({ isServer, store, query }) => {
  let { discussion } = store.getState();

  if (isEmpty(discussion)) {
    const { paperId, discussionThreadId } = query;
    const page = 1;

    store.dispatch(DiscussionActions.fetchThreadPending());
    store.dispatch(DiscussionActions.fetchCommentsPending());
    await store.dispatch(
      DiscussionActions.fetchThread(paperId, discussionThreadId)
    );
    await store.dispatch(
      DiscussionActions.fetchComments(paperId, discussionThreadId, page)
    );

    discussion = store.getState().discussion;
  }

  return { discussion };
};

const BackButton = () => {
  const message = "Go back to all discussions";
  const router = useRouter();
  const url = getBackUrl(router.asPath);

  function getBackUrl(url) {
    let parts = url.split("/");
    parts.pop();
    parts = parts.join("/");
    return parts;
  }

  return (
    <div className={css(styles.backButtonContainer)}>
      <Link href={"/paper/[paperId]/discussion"} as={url}>
        <a className={css(styles.backButton)}>
          {icons.longArrowLeft} {message}
        </a>
      </Link>
    </div>
  );
};

const Thread = (props) => {
  const { title, body, username, date } = props;

  return (
    <div>
      <BackButton />
      <DiscussionCard
        top={
          <Fragment>
            <VoteWidget
              styles={styles.voteWidget}
              score={123}
              fontSize={"16px"}
              width={"58px"}
            />
            <div className={css(styles.threadTitle)}>{title}</div>
            <ShareButton />
          </Fragment>
        }
        info={<div className={css(styles.body)}>{body}</div>}
        infoStyle={styles.threadInfo}
        action={<DiscussionPostMetadata username={username} date={date} />}
      />
    </div>
  );
};

const ShareButton = () => {
  return <div className={css(styles.shareContainer)}>{icons.share}</div>;
};

const Comment = (props) => {
  let date = "";
  let text = "";
  let username = "";

  const { data } = props;

  if (data && !isEmpty(data)) {
    date = data.createdDate;
    text = deserializeComment(data.text);
    username = createUsername(data);
  }

  function deserializeComment(text) {
    try {
      text = Value.fromJSON(JSON.parse(text));
    } catch (SyntaxError) {
      text = Plain.deserialize(text);
    }
    return text;
  }

  return (
    <div className={css(styles.commentContainer)}>
      <DiscussionCard
        top={
          <Fragment>
            <VoteWidget score={0} />
            <DiscussionPostMetadata username={username} date={date} />
          </Fragment>
        }
        info={<TextEditor canEdit={false} initialValue={text} />}
        infoStyle={styles.commentInfo}
        action={"Reply"}
      />
    </div>
  );
};

const MoreButton = () => {
  // TODO: Fetch more comments
  return <div>Show More Comments</div>;
};

const CommentBox = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { paperId, discussionThreadId } = router.query;

  async function onSubmit(comment) {
    dispatch(DiscussionActions.postCommentPending());
    await dispatch(
      DiscussionActions.postComment(paperId, discussionThreadId, comment)
    );
  }

  return (
    <div className={css(styles.commentBoxContainer)}>
      <TextEditor
        canEdit={true}
        canSubmit={true}
        onSubmit={onSubmit}
        commentEditor={true}
      />
    </div>
  );
};

function createUsername({ createdBy }) {
  const { firstName, lastName } = createdBy;
  return `${firstName} ${lastName}`;
}

const styles = StyleSheet.create({
  backButtonContainer: {
    paddingLeft: 68,
  },
  backButton: {
    color: colors.BLACK(0.5),
    textDecoration: "none",
  },
  threadContainer: {
    width: "80%",
    padding: "30px 0px",
    margin: "auto",
  },
  voteWidget: {
    marginRight: 18,
  },
  threadInfo: {
    paddingLeft: 68,
    color: colors.BLACK(0.8),
    "@media only screen and (min-width: 1024px)": {
      width: "calc(100% - 68px - 170px)",
    },
  },
  threadTitle: {
    width: "100%",
    fontSize: 33,
  },
  body: {
    marginBottom: 28,
    marginTop: 14,
    fontSize: 16,
    lineHeight: "24px",
  },
  contentContainer: {
    width: "70%",
    padding: "30px 0px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  shareContainer: {
    background: colors.LIGHT_GREY(),
    color: colors.GREY(),
    height: "46px",
    width: "46px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  commentContainer: {
    padding: "30px 30px 36px 30px",
    width: "100%",
  },
  commentInfo: {
    color: colors.BLACK(0.8),
  },
  commentBoxContainer: {
    width: "100%",
  },
  divider: {
    borderBottom: "1px solid",
    display: "block",
    borderColor: discussionPageColors.DIVIDER,
  },
});

export default DiscussionThreadPage;
