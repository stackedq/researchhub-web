import { breakpoints } from "~/config/themes/screen";
import { connect } from "react-redux";
import { css, StyleSheet } from "aphrodite";
import { getDocumentCard } from "./utils/getDocumentCard";
import { ReactElement, useEffect, useState } from "react";
import colors, { genericCardColors } from "~/config/themes/colors";
import EmptyFeedScreen from "../Home/EmptyFeedScreen";
import Button from "../Form/Button";
import UnifiedDocFeedCardPlaceholder from "./UnifiedDocFeedCardPlaceholder";

function SingleTypeUnifiedDocFeedContainer({
  isLoggedIn,
  loggedIn,
  docType,
  serverLoadedData, // Loaded on the server via getInitialProps on full page load
}): ReactElement<"div"> {
  const [unifiedDocuments, setUnifiedDocuments] = useState<any>(
    serverLoadedData?.results || []
  );
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    // we purposely do this in a useEffect,
    // because if we do it directly in the component there's a weird rendering bug
    // and adding the delay that this useEffect causes fixes it
    const cards = getDocumentCard({
      setUnifiedDocuments,
      unifiedDocumentData: unifiedDocuments,
    });
    setCards(cards);
  }, [unifiedDocuments]);

  return (
    <div className={css(styles.unifiedDocFeedContainer)}>
      {docType.toLowerCase() === "preregistration" && (
        <div className={css(styles.header)}>
          <div className={css(styles.headerRow)}>
            <div className={css(styles.titleContainer)}>
              <h1 className={css(styles.title)}>Funding</h1>
            </div>
            <Button
              label="Apply for Funding"
              onClick={() =>
                window.open("https://forms.gle/QYuEa6YyDeGxSNxh9", "_blank")
              }
              variant="outlined"
            />
          </div>

          <div className={css(styles.description)}>
            Crowdfund preregistrations on ResearchHub.
          </div>
        </div>
      )}
      <div className={css(styles.feedPosts)}>
        {cards.length > 0 ? (
          cards
        ) : (
          <>
            <UnifiedDocFeedCardPlaceholder color="#efefef" />
            <UnifiedDocFeedCardPlaceholder color="#efefef" />
            <UnifiedDocFeedCardPlaceholder color="#efefef" />
          </>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  isLoggedIn: state.auth.isLoggedIn,
});

export default connect(mapStateToProps)(SingleTypeUnifiedDocFeedContainer);

const styles = StyleSheet.create({
  unifiedDocFeedContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    padding: "25px 28px 0",
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      width: "100%",
    },
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      padding: "0",
    },
    [`@media only screen and (max-width: ${breakpoints.xxsmall})`]: {
      width: "100%",
    },
  },
  header: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "flex-start",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  titleContainer: {
    alignItems: "center",
    display: "flex",
  },
  description: {
    fontSize: 15,
    marginBottom: 25,
    maxWidth: 790,
    lineHeight: "22px",
  },
  title: {
    fontWeight: 500,
    textOverflow: "ellipsis",
    marginBottom: 0,
    textTransform: "capitalize",
  },
  feedPosts: {
    position: "relative",
    minHeight: 200,
    borderTop: `1px solid ${genericCardColors.BORDER}`,
  },
});
